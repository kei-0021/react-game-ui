import { RoomParam } from '@/types/server.js';
import { Token } from '@/types/token.js';
import express from 'express';
import fs from 'fs';
import { createServer, Server as HttpServer } from 'http';
import path from 'path';
import { Server as SocketIOServer } from 'socket.io';
import { fileURLToPath } from 'url';
import { initGameServer } from './server-logic.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * サーバー設定の型定義
 */
export interface GameServerOptions {
  port?: number;
  libDistPath?: string;
  clientDistPath?: string;
  corsOrigins?: string[];
  gamePresets?: Record<string, RoomParam>;
  checkGameEnd?: ((gameState: any) => boolean) | null;
  onGameEnd?: ((results: any) => void) | null;
  initialDecks?: any[];
  initialTokenStores?: Record<string, any>;
  initialHand?: Record<string, any>;
  initialTokens?: Record<string, Token[]>;
  initialResources?: any[];
  initialBoard?: any[][];
  cellEffects?: Record<string, any>;
  customEvents?: any;
  initialLogCategories?: Record<string, boolean> | null;
  onServerStart?: (url: string) => void;
}

export class GameServer {
  private port: number;
  private libDistPath: string;
  private clientDistPath: string;
  private corsOrigins: string[];
  private onServerStart?: (url: string) => void;

  private gamePresets: Record<string, RoomParam>;
  private checkGameEnd: ((gameState: any) => boolean) | null;
  private onGameEnd: ((results: any) => void) | null;

  private initialResources: any[];
  private initialBoard: any[][];
  private cellEffects: Record<string, any>;
  private customEvents: any;
  private initialLogCategories: Record<string, boolean> | null;

  public app: express.Application;
  public httpServer: HttpServer;
  public io: SocketIOServer;

  constructor(options: GameServerOptions = {}) {
    this.port = Number(process.env.PORT) || options.port || 3000;
    this.libDistPath = options.libDistPath || path.resolve(__dirname, '../../dist');
    this.clientDistPath = options.clientDistPath || path.resolve(__dirname, '../tests');
    this.corsOrigins = options.corsOrigins || ['http://localhost:5173'];
    this.onServerStart = options.onServerStart;

    // プリセット情報を保持（各ルームはこの情報を元に生成される）
    this.gamePresets = options.gamePresets || {};

    this.checkGameEnd = options.checkGameEnd || null;
    this.onGameEnd = options.onGameEnd || null;

    // サーバー全体のデフォルト設定
    this.initialResources = options.initialResources || [];
    this.initialBoard = options.initialBoard || [];
    this.cellEffects = options.cellEffects || {};
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
        // プリセットをそのまま流し込む
        gamePresets: this.gamePresets,

        // 共通設定・フォールバック用
        checkGameEnd: this.checkGameEnd,
        onGameEnd: this.onGameEnd,
        initialResources: this.initialResources,
        initialBoard: this.initialBoard,
        cellEffects: this.cellEffects,
        customEvents: this.customEvents,
        initialLogCategories: this.initialLogCategories,
      });
    } catch (err) {
      console.error('[Server] Failed to initialize game server logic:', err);
    }
  }

  public start(): void {
    this.httpServer.listen(this.port, () => {
      const address = this.httpServer.address();
      const actualPort = typeof address === 'string' ? address : address?.port;
      const url = `http://localhost:${actualPort}`;
      console.log(`[Server] Server listening on ${url}`);
      if (this.onServerStart) this.onServerStart(url);
    });
  }
}
