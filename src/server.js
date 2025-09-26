// src/server.ts
import { createServer } from "http";
import { Server } from "socket.io";
import deck from "./data/cards.json" assert { type: "json" };

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: { origin: "*" },
});

// --- デッキ管理 ---
let currentDeck = [...deck];  // 山札（まだ引かれていないカード）
let drawnCards = []; // 引いたカード

function shuffleDeck() {
  // 山札だけをシャッフル
  for (let i = currentDeck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [currentDeck[i], currentDeck[j]] = [currentDeck[j], currentDeck[i]];
  }
}

// --- ターン管理 ---
let players = []; 
let currentTurnIndex = 0;

// --- Socket.IO ---
io.on("connection", (socket) => {
  console.log("クライアント接続:", socket.id);

  // プレイヤー登録（接続順）
  players.push({ id: socket.id, name: `Player ${players.length + 1}` });

  // プレイヤー情報を全クライアントに送信
  io.emit("players:update", players);

  // 初期デッキ情報送信
  socket.emit("deck:init", { currentDeck, drawnCards });

  // 現在ターン送信
  io.emit("game:turn", players[currentTurnIndex]?.id);

  // --- デッキ操作 ---
  socket.on("deck:draw", (data) => {
    console.log("deck:draw 受信", data);
    if (currentDeck.length === 0) return;

    const card = currentDeck.shift();

    if (data.playerId) {
      // プレイヤーの手札に追加
      const player = players.find((p) => p.id === data.playerId);
      if (player) {
        if (!player.cards) player.cards = [];
        player.cards.push(card);
      }
    } else {
      // playerId が null の場合は場に残す
      drawnCards.push(card);
    }

    io.emit("deck:update", { currentDeck, drawnCards });
    io.emit("players:update", players);
  });

  socket.on("deck:shuffle", () => {
    console.log("deck:shuffle 受信");
    shuffleDeck();
    io.emit("deck:update", { currentDeck, drawnCards });
  });

  socket.on("deck:reset", () => {
    console.log("deck:reset 受信");

    // 場にあるカードがあれば戻す
    if (drawnCards.length > 0) {
      currentDeck.push(...drawnCards);
      drawnCards = [];
    }

    shuffleDeck();
    io.emit("deck:update", { currentDeck, drawnCards });
  });

  // --- ダイス ---
  socket.on("dice:roll", (sides) => {
    console.log("dice:roll 受信");
    const value = Math.floor(Math.random() * sides) + 1;
    io.emit("dice:rolled", value);
  });

  // --- タイマー ---
  socket.on("timer:start", (duration) => {
    console.log(`timer:start 受信, duration: ${duration}s`);
    let remaining = duration;
    io.emit("timer:start", duration);

    const interval = setInterval(() => {
      remaining--;
      io.emit("timer:update", remaining);
      if (remaining <= 0) {
        clearInterval(interval);
        io.emit("timer:end");
      }
    }, 1000);
  });

  // --- ターン更新 ---
  socket.on("game:next-turn", () => {
    currentTurnIndex = (currentTurnIndex + 1) % players.length;
    io.emit("game:turn", players[currentTurnIndex]?.id);
  });

  // --- 切断処理 ---
  socket.on("disconnect", () => {
    console.log("クライアント切断:", socket.id);
    players = players.filter((p) => p.id !== socket.id);
    if (currentTurnIndex >= players.length) currentTurnIndex = 0;

    io.emit("game:turn", players[currentTurnIndex]?.id);
    io.emit("players:update", players); // 切断後もプレイヤー情報更新
  });
});

httpServer.listen(3000, () => {
  console.log("Socket.IO サーバーがポート3000で起動しました");
});
