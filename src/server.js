// src/server.js
import { createServer } from "http";
import { Server } from "socket.io";
import { cardEffects } from "./data/cardEffects.js";
import deck from "./data/cards.json" assert { type: "json" };
import lightDeck from "./data/lightCards.json" assert { type: "json" };

// --- デッキ管理 ---
const decks = {
  main: deck.map(c => ({
    ...c,
    deckId: "main",
    onPlay: cardEffects[c.name] || (() => {}),
    location: "deck"
  })),
  light: lightDeck.map(c => ({
    ...c,
    deckId: "light",
    onPlay: cardEffects[c.name] || (() => {}),
    location: "deck"
  }))
};

const drawnCards = {
  main: [],
  light: []
};

// --- シャッフル関数 ---
function shuffleDeck(deckId) {
  const currentDeck = decks[deckId].filter(c => c.location === "deck");
  for (let i = currentDeck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [currentDeck[i], currentDeck[j]] = [currentDeck[j], currentDeck[i]];
  }
  decks[deckId] = currentDeck.concat(decks[deckId].filter(c => c.location !== "deck"));
}

// --- ターン管理 ---
let players = [];
let currentTurnIndex = 0;

// --- Socket.IO ---
const httpServer = createServer();
const io = new Server(httpServer, { cors: { origin: "*" } });

// --- プレイヤースコア管理 ---
function addScore(playerId, points) {
  const player = players.find(p => p.id === playerId);
  if (!player) return;
  player.score = (player.score || 0) + points;
  io.emit("players:update", players);
}

// --- 接続処理 ---
io.on("connection", socket => {
  console.log("クライアント接続:", socket.id);

  players.push({ id: socket.id, name: `Player ${players.length + 1}`, cards: [], score: 0 });
  io.emit("players:update", players);

  // 各デッキの初期化を送信
  Object.keys(decks).forEach(deckId => {
    socket.emit(`deck:init:${deckId}`, {
      currentDeck: decks[deckId].filter(c => c.location === "deck"),
      drawnCards: drawnCards[deckId]
    });
  });

  io.emit("game:turn", players[currentTurnIndex]?.id);

  // --- 山札からカードを引く ---
  socket.on("deck:draw", ({ deckId, playerId }) => {
    const currentDeck = decks[deckId].filter(c => c.location === "deck");
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
      drawnCards[deckId].push(card);
    }

    decks[deckId] = currentDeck.concat(decks[deckId].filter(c => c.location !== "deck"));
    io.emit(`deck:update:${deckId}`, {
      currentDeck: decks[deckId].filter(c => c.location === "deck"),
      drawnCards: drawnCards[deckId]
    });
    io.emit("players:update", players);
  });

  // --- 山札をシャッフル ---
  socket.on("deck:shuffle", ({ deckId }) => {
    shuffleDeck(deckId);
    io.emit(`deck:update:${deckId}`, {
      currentDeck: decks[deckId].filter(c => c.location === "deck"),
      drawnCards: drawnCards[deckId]
    });
  });

  // --- 山札をリセット（field のカードを戻す） ---
  socket.on("deck:reset", ({ deckId }) => {
    const fieldCards = decks[deckId].filter(c => c.location === "field");
    fieldCards.forEach(c => {
      c.location = "deck";
      drawnCards[deckId] = drawnCards[deckId].filter(d => d.id !== c.id);
    });
    shuffleDeck(deckId);
    io.emit(`deck:update:${deckId}`, {
      currentDeck: decks[deckId].filter(c => c.location === "deck"),
      drawnCards: drawnCards[deckId]
    });
  });

  // --- カード効果発動 ---
  socket.on("card:play", ({ deckId, cardId, playerId }) => {
    const card = decks[deckId].find(c => c.id === cardId);
    if (!card) return;

    // 効果を発動
    if (card.onPlay) card.onPlay({ playerId, addScore });

    // プレイヤーの手札から除去
    if (playerId) {
      const player = players.find(p => p.id === playerId);
      if (player && player.cards) {
        player.cards = player.cards.filter(c => c.id !== cardId);
      }
    }

    // field に置く
    card.location = "field";
    drawnCards[deckId].push(card);

    io.emit(`deck:update:${deckId}`, {
      currentDeck: decks[deckId].filter(c => c.location === "deck"),
      drawnCards: drawnCards[deckId]
    });
    io.emit("players:update", players);
  });

  // --- ダイス ---
  socket.on("dice:roll", ({ diceId, sides }) => {
    const value = Math.floor(Math.random() * sides) + 1;
    io.emit(`dice:rolled:${diceId}`, value);
  });

  // --- タイマー ---
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

  // --- 次のターン ---
  socket.on("game:next-turn", () => {
    currentTurnIndex = (currentTurnIndex + 1) % players.length;
    io.emit("game:turn", players[currentTurnIndex]?.id);
  });

  // --- 切断処理 ---
  socket.on("disconnect", () => {
    console.log("クライアント切断:", socket.id);
    players = players.filter(p => p.id !== socket.id);
    if (currentTurnIndex >= players.length) currentTurnIndex = 0;
    io.emit("game:turn", players[currentTurnIndex]?.id);
    io.emit("players:update", players);
  });
});

httpServer.listen(3000, () => {
  console.log("Socket.IO サーバーがポート3000で起動しました");
});
