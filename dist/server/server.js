#!/usr/bin/env node
import express from "express";
import fs from "fs";
import { createServer } from "http";
import path from "path";
import { Server as SocketIOServer } from "socket.io";
import { fileURLToPath } from "url";
import { initGameServer } from "./server-logic.js";

// __dirname の互換性確保
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// デフォルトのパス設定
const defaultLibDist = path.resolve(__dirname, "../../dist");
const defaultClientDist = path.resolve(__dirname, "../tests");

/**
 * GameServer クラス
 * 利用者がゲームルール（プリセットや終了判定）を注入し、
 * Socket.io を介したリアルタイムゲームサーバーを起動する。
 */
export class GameServer {
  constructor(options = {}) {
    // サーバー基本設定
    this.port = Number(process.env.PORT) || options.port || 3000;
    this.libDistPath = options.libDistPath || defaultLibDist;
    this.clientDistPath = options.clientDistPath || defaultClientDist;
    this.corsOrigins = options.corsOrigins || ["http://localhost:5173"];
    this.onServerStart = options.onServerStart;

    // --- ゲームロジック設定 (プリセット方式) ---
    // key: プリセットID, value: デッキや終了判定を含む設定オブジェクト
    this.gamePresets = options.gamePresets || {};

    // --- 終了判定ロジック (グローバル設定) ---
    // プリセット側に定義がない場合のフォールバックとして機能
    this.checkGameEnd = options.checkGameEnd || null;
    this.onGameEnd = options.onGameEnd || null;

    // --- 各種初期データ (プリセット未指定時のデフォルト用) ---
    this.initialDecks = options.initialDecks || [];
    this.cardEffects = options.cardEffects || {};
    this.initialTokenStore = options.initialTokenStore || {};
    this.initialHand = options.initialHand || {};
    this.initialTokens = options.initialTokens || {};
    this.initialResources = options.initialResources || [];
    this.initialBoard = options.initialBoard || [];
    this.cellEffects = options.cellEffects || [];
    this.customEvents = options.customEvents || [];

    // ログ設定
    this.initialLogCategories = options.initialLogCategories || null;

    // Express & Socket.io の初期化
    this.app = express();
    this.httpServer = createServer(this.app);
    this.io = new SocketIOServer(this.httpServer, {
      cors: {
        origin: this.corsOrigins.concat(
          process.env.NODE_ENV === "production" ? ["*"] : [],
        ),
        methods: ["GET", "POST"],
      },
    });

    this.setupStaticRoutes();
    this.initSocketLogic();
  }

  /**
   * 静的ファイルの配信設定
   */
  setupStaticRoutes() {
    // ライブラリ自体の配信
    if (fs.existsSync(this.libDistPath)) {
      this.app.use("/lib", express.static(this.libDistPath));
    } else {
      console.warn(`[Server] Library dist not found: ${this.libDistPath}`);
    }

    // クライアントアプリ（テスト用など）の配信
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
          res.send("<h1>Client app not built yet.</h1>"),
        );
      }
    } else {
      console.warn(`[Server] Client dist not found: ${this.clientDistPath}`);
      this.app.get("/", (_req, res) =>
        res.send("<h1>Client app not configured.</h1>"),
      );
    }
  }

  /**
   * ゲームロジック（Socket.io）の初期化
   */
  initSocketLogic() {
    try {
      // 全設定を server-logic.js へ渡す
      initGameServer(this.io, {
        gamePresets: this.gamePresets,

        // 終了判定ロジックの注入
        checkGameEnd: this.checkGameEnd,
        onGameEnd: this.onGameEnd,

        // 各種初期設定（フォールバック用）
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

  /**
   * サーバーの起動
   */
  start() {
    this.httpServer.listen(this.port, () => {
      const actualPort = this.httpServer.address().port;
      const url = `http://localhost:${actualPort}`;
      console.log(`[Server] Server listening on ${url}`);
      if (this.onServerStart) this.onServerStart(url);
    });
  }
}
