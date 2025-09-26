// src/server.js
import { createServer } from "http";
import { Server } from "socket.io";
import { cardEffects } from "./data/cardEffects.js";
import deck from "./data/cards.json" assert { type: "json" };

// --- デッキ管理 ---
const allCards = deck.map(card => ({
  ...card,
  onPlay: cardEffects[card.name] || (() => {}),
  location: "deck" // deck / hand / field
}));

let currentDeck = allCards.filter(c => c.location === "deck");
let drawnCards = [];

// シャッフル関数
function shuffleDeck() {
  for (let i = currentDeck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [currentDeck[i], currentDeck[j]] = [currentDeck[j], currentDeck[i]];
  }
}

// --- ターン管理 ---
let players = [];
let currentTurnIndex = 0;

// --- Socket.IO ---
const httpServer = createServer();
const io = new Server(httpServer, { cors: { origin: "*" } });

io.on("connection", (socket) => {
  console.log("クライアント接続:", socket.id);

  players.push({ id: socket.id, name: `Player ${players.length + 1}`, cards: [] });
  io.emit("players:update", players);
  socket.emit("deck:init", { currentDeck, drawnCards, players });
  io.emit("game:turn", players[currentTurnIndex] && players[currentTurnIndex].id);

  socket.on("deck:draw", ({ playerId }) => {
    if (currentDeck.length === 0) return;
    const card = currentDeck.shift();
    if (!card) return;

    if (playerId) {
      const player = players.find(p => p.id === playerId);
      if (player) {
        player.cards = player.cards || [];
        card.location = "hand";
        player.cards.push(card);
      }
    } else {
      card.location = "field";
      drawnCards.push(card);
    }

    // クライアントに現在の状態を送信
    io.emit("deck:update", { currentDeck, drawnCards });
    io.emit("players:update", players); // ←ここで手札情報を更新
  });

  socket.on("deck:shuffle", () => {
    shuffleDeck();
    io.emit("deck:update", { currentDeck, drawnCards, players });
  });

  socket.on("deck:reset", () => {
    currentDeck = allCards.map(c => ({ ...c, location: "deck" }));
    drawnCards = [];
    players.forEach(p => (p.cards = []));
    shuffleDeck();
    io.emit("deck:update", { currentDeck, drawnCards, players });
  });

  // カード発動
  socket.on("card:play", ({ cardId, playerId }) => {
    // allCards からカード取得
    const card = allCards.find(c => c.id === cardId);
    if (!card) return;

    // 効果発動
    if (card.onPlay) card.onPlay();

    // カードを手札から削除
    if (playerId) {
      const player = players.find(p => p.id === playerId);
      if (player && player.cards) {
        player.cards = player.cards.filter(c => c.id !== cardId);
      }
    }

    // 場に置く
    card.location = "field";
    drawnCards.push(card);

    // 更新をクライアントに送信
    io.emit("deck:update", { currentDeck, drawnCards });
    io.emit("players:update", players);
  });


  socket.on("dice:roll", (sides) => {
    const value = Math.floor(Math.random() * sides) + 1;
    io.emit("dice:rolled", value);
  });

  socket.on("timer:start", (duration) => {
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

  socket.on("game:next-turn", () => {
    currentTurnIndex = (currentTurnIndex + 1) % players.length;
    io.emit("game:turn", players[currentTurnIndex] && players[currentTurnIndex].id);
  });

  socket.on("disconnect", () => {
    console.log("クライアント切断:", socket.id);
    players = players.filter(p => p.id !== socket.id);
    if (currentTurnIndex >= players.length) currentTurnIndex = 0;
    io.emit("game:turn", players[currentTurnIndex] && players[currentTurnIndex].id);
    io.emit("players:update", players);
  });
});

httpServer.listen(3000, () => {
  console.log("Socket.IO サーバーがポート3000で起動しました");
});
