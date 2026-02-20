import { Card } from '@/types/card.js';
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
  cardEffects?: Record<string, any>;
  initialTokenStores?: Record<string, any>;
  initialHand?: Record<string, any>;
  initialTokens?: Record<string, Token[]>;
  initialResources?: any[];
  initialBoard?: any[][];
  cellEffects?: Record<string, any>; // any[] から変更
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

  private initialDecks: any[];
  private cardEffects: Record<string, any>;
  private initialTokenStores: Record<string, any>;
  private initialHand: Record<string, Card[]>;
  private initialTokens: Record<string, Token[]>;
  private initialResources: any[];
  private initialBoard: any[][];
  private cellEffects: Record<string, any>; // any[] から修正
  private customEvents: any; // any[] から修正
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

    this.gamePresets = options.gamePresets || {};
    this.checkGameEnd = options.checkGameEnd || null;
    this.onGameEnd = options.onGameEnd || null;

    this.initialDecks = options.initialDecks || [];
    this.cardEffects = options.cardEffects || {};
    this.initialTokenStores = options.initialTokenStores || {};
    this.initialHand = options.initialHand || {};
    this.initialTokens = options.initialTokens || {};
    this.initialResources = options.initialResources || [];
    this.initialBoard = options.initialBoard || [];
    this.cellEffects = options.cellEffects || {}; // [] から {} に修正
    this.customEvents = options.customEvents || {}; // [] から {} に修正
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

  private initSocketLogic(): void {
    try {
      initGameServer(this.io, {
        gamePresets: this.gamePresets,
        checkGameEnd: this.checkGameEnd,
        onGameEnd: this.onGameEnd,
        initialDecks: this.initialDecks,
        cardEffects: this.cardEffects,
        initialResources: this.initialResources,
        initialHand: this.initialHand,
        initialTokenStores: this.initialTokenStores,
        initialTokens: this.initialTokens,
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
