import path from "path";
import { GameServer } from "../src/server.js";

const demoServer = new GameServer({
  port: 4000,
  clientDistPath: path.resolve("./tests"), // デモ用の index.html 配下
  libDistPath: path.resolve("../dist"),    // ライブラリ dist 配信
  corsOrigins: ["http://localhost:5173", "http://localhost:4000"],
  onServerStart: (url) => {
    console.log(`🎮 Demo server running at: ${url}`);
  },
});

// サーバー起動
demoServer.start();
