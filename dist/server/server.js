import express from 'express';
import fs from 'fs';
import { createServer } from 'http';
import path from 'path';
import { Server as SocketIOServer } from 'socket.io';
import { fileURLToPath } from 'url';
import { initGameServer } from './server-logic.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
/**
 * GameServer
 * ExpressとSocket.IOを統合し、ゲームプリセットの管理、静的ファイル配信、
 * および実行時のGameParam動的更新（ホットスワップ）を統括するコアクラス。
 * @property {number} port - サーバーがリッスンするポート番号
 * @property {string} libDistPath - /lib パスで提供されるビルド済みライブラリ資産のパス
 * @property {string} clientDistPath - ルートパスで提供されるクライアント側静的ファイルのパス
 * @property {string[]} corsOrigins - CORSを許可するオリジンのリスト
 * @property {Record<gameId, GameParam>} gameParams - 登録されている各ゲームの初期パラメータ定義
 * @property {any} customEvents - ユーザー定義のカスタムイベントハンドラ
 * @property {Partial<Record<LogCategory, boolean>> | null} initialLogCategories - ログ出力の制御設定
 * @property {LogLevel | null} initialLogLevel - ログ出力のレベル
 * @property {express.Application} app - Expressアプリケーションインスタンス
 * @property {HttpServer} httpServer - Node.js HTTPサーバーインスタンス
 * @property {SocketIOServer} io - 通信を制御するSocket.IOサーバーインスタンス
 */
export class GameServer {
    port;
    libDistPath;
    clientDistPath;
    corsOrigins;
    gameParams;
    activeRooms = new Map();
    customEvents;
    initialLogCategories;
    initialLogLevel;
    app;
    httpServer;
    io;
    constructor(options) {
        this.port = Number(process.env.PORT) || options.port || 3000;
        this.libDistPath = options.libDistPath || path.resolve(__dirname, '../../dist');
        this.clientDistPath = options.clientDistPath || path.resolve(__dirname, '../tests');
        this.corsOrigins = options.corsOrigins || ['http://localhost:5173'];
        // プリセット情報を保持（必須項目として代入）
        this.gameParams = options.gameParams;
        // サーバー全体のデフォルト設定
        this.customEvents = options.customEvents || {};
        this.initialLogCategories = options.initialLogCategories || null;
        this.initialLogLevel = options.initialLogLevel || null;
        this.app = express();
        this.httpServer = createServer(this.app);
        this.io = new SocketIOServer(this.httpServer, {
            cors: {
                origin: (origin, callback) => {
                    const allowed = this.corsOrigins.concat(process.env.NODE_ENV === 'production' ? ['*'] : []);
                    if (!origin || allowed.includes(origin) || allowed.includes('*')) {
                        callback(null, true);
                    }
                    else {
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
    setupStaticRoutes() {
        if (fs.existsSync(this.libDistPath)) {
            this.app.use('/lib', express.static(this.libDistPath));
        }
        if (fs.existsSync(this.clientDistPath)) {
            this.app.use(express.static(this.clientDistPath));
            const indexPath = path.join(this.clientDistPath, 'index.html');
            this.app.get('/', (_req, res) => {
                if (fs.existsSync(indexPath)) {
                    res.sendFile(indexPath);
                }
                else {
                    res.send('<h1>Client app not built yet.</h1>');
                }
            });
        }
    }
    /**
     * ゲームロジックの初期化
     * 各プリセット情報をそのまま渡すことで、ルームごとに独立した効果を適用可能にする
     */
    initSocketLogic() {
        try {
            initGameServer(this.io, {
                gameParams: this.gameParams,
                customEvents: this.customEvents,
                initialLogCategories: this.initialLogCategories,
                initialLogLevel: this.initialLogLevel,
            }, this.activeRooms);
        }
        catch (err) {
            console.error('[Server] Failed to initialize game server logic:', err);
        }
    }
    getActiveRooms() {
        return this.activeRooms;
    }
    /**
     * 指定されたポートでHTTPサーバーの待機を開始する。
     * 起動完了後、コンソールにアクセス可能なURL（http://localhost:{port}）を出力する。
     */
    start() {
        this.httpServer.listen(this.port, () => {
            const address = this.httpServer.address();
            const actualPort = typeof address === 'string' ? address : address?.port;
            const url = `http://localhost:${actualPort}`;
            console.log(`[Server] Server listening on ${url}`);
        });
    }
}
