#!/usr/bin/env node
// react-game-ui/server.js

import express from "express";
import { createServer } from "http";
import path from "path";
import { Server as SocketIOServer } from "socket.io";
import { fileURLToPath } from "url";

// 💥 修正: game-logic.js からゲームロジックをインポート
import { initGameServer } from './server-logic.js';

// __dirname 的なやつ
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --------------------
// Express / Socket.IO サーバー起動
// --------------------

const app = express();
const httpServer = createServer(app);
const io = new SocketIOServer(httpServer);

const isProduction = process.env.NODE_ENV === "production";
const PORT = process.env.PORT || 3000;
const CLIENT_APP_DIST_PATH = process.env.CLIENT_APP_DIST_PATH; // 利用者のビルド成果物パス

// 1. ライブラリの dist（CSS/JS）を /lib 配下で配信 (UIコンポーネント用)
const libDist = path.join(__dirname, "dist");
app.use("/lib", express.static(libDist));

// 2. 利用者のビルド成果物 dist
const appDist = CLIENT_APP_DIST_PATH 
  ? path.resolve(CLIENT_APP_DIST_PATH)
  : path.join(__dirname, "dist"); // fallback (開発・テスト用)
  
if (isProduction || CLIENT_APP_DIST_PATH) {
    app.use(express.static(appDist));

    // ルートは利用者の index.html を返す
    app.get("/", (req, res) => {
        res.sendFile(path.join(appDist, "index.html"));
    });
} else {
    // 開発中のフィードバックとして
    console.log("クライアントアプリケーションの配信は設定されていません。環境変数 CLIENT_APP_DIST_PATH を設定してください。");
}

// Socket.IO ゲームサーバーロジックの初期化
initGameServer(io);


httpServer.listen(PORT, () => {
    console.log(`[Server] Production Server listening on port ${PORT}`);
    if (isProduction) {
        console.log(`[Server] Serving client app from: ${appDist}`);
    }
});

// 💥 修正: ここから下にあった `initGameServer` の定義は game-logic.js に移動しました。
