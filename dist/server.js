#!/usr/bin/env node
import express from "express";
import fs from "fs";
import { createServer } from "http";
import path from "path";
import { Server as SocketIOServer } from "socket.io";
import { fileURLToPath } from "url";
import { initGameServer } from "./server-logic.js";

// __dirname 的なやつ
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const defaultLibDist = path.resolve(__dirname, "../../dist");
const defaultClientDist = path.resolve(__dirname, "../tests");

export class GameServer {
  constructor(options = {}) {
    this.port = Number(process.env.PORT) || options.port || 3000;
    this.libDistPath = options.libDistPath || defaultLibDist;
    this.clientDistPath = options.clientDistPath || defaultClientDist;
    this.corsOrigins = options.corsOrigins || ["http://localhost:5173"];
    this.onServerStart = options.onServerStart;
    
    // 💡 修正: ルームごとの設定を可能にするため、gamePresetsを追加
    // key: プリセットID, value: 初期デッキ、カード効果などの設定オブジェクト
    this.gamePresets = options.gamePresets || {}; 
    
    // 💡 修正: ルーム設定に含まれるべきグローバル設定を削除（またはプリセットがない場合のフォールバックとして残す）
    // 今回は、initGameServer のフォールバックロジックに任せるため、これらはオプションとして保持します
    this.initialDecks = options.initialDecks || []; 
    this.cardEffects = options.cardEffects || {};
    this.initialTokenStore = options.initialTokenStore || {};
    this.initialHand = options.initialHand || {};
    this.initialTokens = options.initialTokens || {};
    this.initialResources = options.initialResources || [];
    this.initialBoard = options.initialBoard || [];
    this.cellEffects = options.cellEffects || [];
    this.customEvents = options.customEvents || [];

    this.initialLogCategories = options.initialLogCategories || null;

    this.app = express();
    this.httpServer = createServer(this.app);
    this.io = new SocketIOServer(this.httpServer, {
      cors: { 
        origin: this.corsOrigins.concat(process.env.NODE_ENV === 'production' ? ['*'] : []),
        methods: ["GET", "POST"] 
      },
    });

    this.setupStaticRoutes();
    this.initSocketLogic();
  }

  setupStaticRoutes() {
    if (fs.existsSync(this.libDistPath)) {
      this.app.use("/lib", express.static(this.libDistPath));
    } else {
      console.warn(`[Server] Library dist not found: ${this.libDistPath}`);
    }

    if (fs.existsSync(this.clientDistPath)) {
      this.app.use(express.static(this.clientDistPath));
      const indexPath = path.join(this.clientDistPath, "index.html");
      if (fs.existsSync(indexPath)) {
        this.app.get("/", (_req, res) => {
          res.sendFile(indexPath); 
        });
      } else {
        console.warn(`[Server] index.html not found in ${this.clientDistPath}`);
        this.app.get("/", (_req, res) =>
          res.send("<h1>Client app not built yet.</h1>")
        );
      }
    } else {
      console.warn(`[Server] Client dist not found: ${this.clientDistPath}`);
      this.app.get("/", (_req, res) =>
        res.send("<h1>Client app not configured.</h1>")
      );
    }
  }

  initSocketLogic() {
    try {
      // 💡 修正: initGameServer に渡すオブジェクトに gamePresets を追加
      // また、initGameServerがフォールバックできるように、元のグローバル設定も渡します
      initGameServer(this.io, {
        gamePresets: this.gamePresets, // 💡 これが新しいルームごとの設定源
        
        // 既存のグローバル設定も引き続き渡します (プリセットがない場合のフォールバック用)
        initialDecks: this.initialDecks,
        cardEffects: this.cardEffects,
        initialResources: this.initialResources,
        initialHand: this.initialHand,
        initialTokenStore: this.initialTokenStore,
        initialTokens: this.initialTokens,
        initialBoard: this.initialBoard,
        cellEffects: this.cellEffects,
        customEvents: this.customEvents,
        
        initialLogCategories: this.initialLogCategories,
      });
    } catch (err) {
      console.error("[Server] Failed to initialize game server logic:", err);
    }
  }

  start() {
    this.httpServer.listen(this.port, () => {
      const actualPort = this.httpServer.address().port;
      const url = `http://localhost:${actualPort}`;
      console.log(`[Server] Server listening on ${url}`);
      if (this.onServerStart) this.onServerStart(url);
    });
  }
}