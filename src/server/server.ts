// src/server.ts
import { GameId, GameParam } from '@/types/server.js';
import { GameMeta, LobbyGameList } from '@/types/socketData.js';
import express from 'express';
import fs from 'fs';
import { createServer, Server as HttpServer } from 'http';
import path from 'path';
import { Server as SocketIOServer } from 'socket.io';
import { fileURLToPath } from 'url';
import { initGameServer } from './server-logic.js';
import { LogCategory } from './server-utils.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * サーバー設定の型定義
 */
export type GameServerOptions = {
  port?: number;
  libDistPath?: string;
  clientDistPath?: string;
  corsOrigins?: string[];
  gameParams: Record<GameId, GameParam>;
  customEvents?: any;
  initialLogCategories?: Partial<Record<LogCategory, boolean>> | null;
};

/**
 * GameServer
 * ExpressとSocket.IOを統合し、ゲームプリセットの管理、静的ファイル配信、
 * および実行時のGameParam動的更新（ホットスワップ）を統括するコアクラス。
 * @property {number} port - サーバーがリッスンするポート番号
 * @property {string} libDistPath - /lib パスで提供されるビルド済みライブラリ資産のパス
 * @property {string} clientDistPath - ルートパスで提供されるクライアント側静的ファイルのパス
 * @property {string[]} corsOrigins - CORSを許可するオリジンのリスト
 * @property {Record<string, GameParam>} gameParams - 登録されている各ゲームの初期パラメータ定義
 * @property {any} customEvents - ユーザー定義のカスタムイベントハンドラ
 * @property {Partial<Record<LogCategory, boolean>> | null} initialLogCategories - ログ出力の制御設定
 * @property {express.Application} app - Expressアプリケーションインスタンス
 * @property {HttpServer} httpServer - Node.js HTTPサーバーインスタンス
 * @property {SocketIOServer} io - 通信を制御するSocket.IOサーバーインスタンス
 */
export class GameServer {
  private port: number;
  private libDistPath: string;
  private clientDistPath: string;
  private corsOrigins: string[];

  private gameParams: Record<GameId, GameParam>;
  private customEvents: any;
  private initialLogCategories: Partial<Record<LogCategory, boolean>> | null;

  public app: express.Application;
  public httpServer: HttpServer;
  public io: SocketIOServer;

  constructor(options: GameServerOptions) {
    this.port = Number(process.env.PORT) || options.port || 3000;
    this.libDistPath = options.libDistPath || path.resolve(__dirname, '../../dist');
    this.clientDistPath = options.clientDistPath || path.resolve(__dirname, '../tests');
    this.corsOrigins = options.corsOrigins || ['http://localhost:5173'];

    // プリセット情報を保持（必須項目として代入）
    this.gameParams = options.gameParams;

    // サーバー全体のデフォルト設定
    this.customEvents = options.customEvents || {};
    this.initialLogCategories = options.initialLogCategories || null;

    this.app = express();
    this.httpServer = createServer(this.app);
    this.io = new SocketIOServer(this.httpServer, {
      cors: {
        origin: (origin, callback) => {
          const allowed = this.corsOrigins.concat(process.env.NODE_ENV === 'production' ? ['*'] : []);
          if (!origin || allowed.includes(origin) || allowed.includes('*')) {
            callback(null, true);
          } else {
            callback(new Error('Not allowed by CORS'));
          }
        },
        methods: ['GET', 'POST'],
      },
    });

    this.setupStaticRoutes();
    this.initSocketLogic();
  }

  /**
   * 静的ファイルのルーティングを設定する。
   * ライブラリ本体（/lib）とクライアント側資産（/）の各ディレクトリが存在する場合、
   * Expressのミドルウェアを使用して公開し、ルートアクセス時の index.html 配信を制御する。
   */
  private setupStaticRoutes(): void {
    if (fs.existsSync(this.libDistPath)) {
      this.app.use('/lib', express.static(this.libDistPath));
    }

    if (fs.existsSync(this.clientDistPath)) {
      this.app.use(express.static(this.clientDistPath));
      const indexPath = path.join(this.clientDistPath, 'index.html');
      this.app.get('/', (_req, res) => {
        if (fs.existsSync(indexPath)) {
          res.sendFile(indexPath);
        } else {
          res.send('<h1>Client app not built yet.</h1>');
        }
      });
    }
  }

  /**
   * ゲームロジックの初期化
   * 各プリセット情報をそのまま渡すことで、ルームごとに独立した効果を適用可能にする
   */
  private initSocketLogic(): void {
    try {
      initGameServer(this.io, {
        gameParams: this.gameParams,
        customEvents: this.customEvents,
        initialLogCategories: this.initialLogCategories,
      });
    } catch (err) {
      console.error('[Server] Failed to initialize game server logic:', err);
    }
  }

  /**
   * 指定されたポートでHTTPサーバーの待機を開始する。
   * 起動完了後、コンソールにアクセス可能なURL（http://localhost:{port}）を出力する。
   */
  public start(): void {
    this.httpServer.listen(this.port, () => {
      const address = this.httpServer.address();
      const actualPort = typeof address === 'string' ? address : address?.port;
      const url = `http://localhost:${actualPort}`;
      console.log(`[Server] Server listening on ${url}`);
    });
  }

  /**
   * 指定したGameIdのパラメータを安全に更新し通知する
   */
  public updateGameParam(gameId: string, param: GameParam): void {
    if (!this.gameParams[gameId]) {
      console.warn(`[Server] 未登録のGameIdです: ${gameId}`);
    }

    // 削除時は param が undefined で渡ってくる
    if (param === undefined) {
      delete this.gameParams[gameId];
      console.log(`[Server] Removed: ${gameId}.`);
    } else {
      // GameParamの更新
      this.gameParams[gameId] = param;
      // 実行中の全ルームへ「最新ルール」をzs同期
      // reloadActiveRooms(this.io, gameId, param);
    }

    // クライアントにゲーム一覧を送信
    const gameList: GameMeta[] = Object.keys(this.gameParams).map((id) => ({
      gameId: id,
      gameIcon: this.gameParams[id].gameIcon,
      maxPlayers: this.gameParams[id].maxPlayers,
      initialHand: this.gameParams[id].initialHand,
      initialDecks: this.gameParams[id].initialDecks,
      initialTokens: this.gameParams[id].initialTokens,
      draggables: this.gameParams[id].draggables,
      components: this.gameParams[id].components,
    }));
    this.io.emit('lobby:game-list', {
      games: gameList,
    } as LobbyGameList);
  }
}
