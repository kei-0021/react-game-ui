// src/server.ts
import { RoomParam } from '@/types/server.js';
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
  onServerStart?: (url: string) => void;
  gamePresets: Record<string, RoomParam>;
  customEvents?: any;
  initialLogCategories?: Partial<Record<LogCategory, boolean>> | null;
};

export class GameServer {
  private port: number;
  private libDistPath: string;
  private clientDistPath: string;
  private corsOrigins: string[];
  private onServerStart?: (url: string) => void;

  private gamePresets: Record<string, RoomParam>;
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
    this.onServerStart = options.onServerStart;

    // プリセット情報を保持（必須項目として代入）
    this.gamePresets = options.gamePresets;

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
        gamePresets: this.gamePresets,
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
