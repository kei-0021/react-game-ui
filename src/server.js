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
    this.port = Number(process.env.PORT) || options.port || 3000; // 0ではなく3000をデフォルトに設定変更
    this.libDistPath = options.libDistPath || defaultLibDist;
    this.clientDistPath = options.clientDistPath || defaultClientDist;
    this.corsOrigins = options.corsOrigins || ["http://localhost:5173"];
    this.onServerStart = options.onServerStart;
    this.initialDecks = options.initialDecks || []; 
    this.cardEffects = options.cardEffects || {};
    this.initialResources = options.initialResources || [];
    // === ログ設定の初期値をコンストラクタで受け取る (追加) ===
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
          // ポート情報の動的挿入ロジックを完全に削除
          // Render環境ではポート取得のタイミングが不安定なため
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
      // === initGameServer にログ設定を渡す (修正) ===
      initGameServer(this.io, {
        initialDecks: this.initialDecks,
        cardEffects: this.cardEffects,
        initialResources: this.initialResources,
        initialLogCategories: this.initialLogCategories, // ←ここで渡す
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
