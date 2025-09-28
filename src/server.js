import { createServer } from "http";
import { Server } from "socket.io";

const decks = {};
const drawnCards= {};

let players = [];
let currentTurnIndex = 0;

const httpServer = createServer();
const io = new Server(httpServer, { cors: { origin: "*" } });

// スコア加算関数
function addScore(playerId, points) {
  const player = players.find(p => p.id === playerId);
  if (!player) return;
  player.score = (player.score || 0) + points;
  console.log(`[addScore] ${player.name} に ${points} ポイント加算`);
  io.emit("players:update", players);
}

// デッキをシャッフル
function shuffleDeck(deckId) {
  if (!decks[deckId]) return;
  const currentDeck = decks[deckId].filter(c => c.location === "deck");
  for (let i = currentDeck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [currentDeck[i], currentDeck[j]] = [currentDeck[j], currentDeck[i]];
  }
  decks[deckId] = currentDeck.concat(decks[deckId].filter(c => c.location !== "deck"));
  console.log(`[shuffleDeck] デッキ ${deckId} をシャッフルしました`);
}

// クライアント接続
io.on("connection", socket => {
  console.log(`[connection] クライアント接続: ${socket.id}`);

  // 新規プレイヤーを追加
  const newPlayer = { id: socket.id, name: `Player ${players.length + 1}`, cards: [], score: 0 };
  players.push(newPlayer);
  console.log(`[connection] 新規プレイヤー追加:`, newPlayer);
  io.emit("players:update", players);
  io.emit("game:turn", players[currentTurnIndex]?.id);

  // デッキ初期化
  socket.on("deck:add", ({ deckId, name, cards }) => {
    if (decks[deckId]) return;

    decks[deckId] = cards.map(c => ({
      ...c,
      deckId,
      location: "deck"
    }));

    drawnCards[deckId] = [];
    console.log(`[deck:add] デッキ "${name}" 初期化完了`);

    io.emit(`deck:init:${deckId}`, {
      currentDeck: decks[deckId].filter(c => c.location === "deck"),
      drawnCards: drawnCards[deckId]
    });
  });

  // カードを引く
  socket.on("deck:draw", ({ deckId, playerId }) => {
    if (!decks[deckId]) return;

    const currentDeck = decks[deckId].filter(c => c.location === "deck");
    if (!currentDeck.length) return;

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
    console.log(`[deck:draw] デッキ ${deckId} からカードを引きました:`, card);

    io.emit(`deck:update:${deckId}`, {
      currentDeck: decks[deckId].filter(c => c.location === "deck"),
      drawnCards: drawnCards[deckId]
    });
    io.emit("players:update", players);
  });

  // デッキシャッフル
  socket.on("deck:shuffle", ({ deckId }) => {
    shuffleDeck(deckId);
    console.log(`[deck:shuffle] デッキ ${deckId} シャッフル`);
    io.emit(`deck:update:${deckId}`, {
      currentDeck: decks[deckId].filter(c => c.location === "deck"),
      drawnCards: drawnCards[deckId]
    });
  });

  // デッキリセット
  socket.on("deck:reset", ({ deckId }) => {
    if (!decks[deckId]) return;

    const fieldCards = decks[deckId].filter(c => c.location === "field");
    fieldCards.forEach(c => {
      c.location = "deck";
      drawnCards[deckId] = drawnCards[deckId].filter(d => d.id !== c.id);
    });

    shuffleDeck(deckId);
    console.log(`[deck:reset] デッキ ${deckId} リセット`);
    io.emit(`deck:update:${deckId}`, {
      currentDeck: decks[deckId].filter(c => c.location === "deck"),
      drawnCards: drawnCards[deckId]
    });
  });

  // カード使用
  socket.on("card:play", ({ deckId, cardId, playerId }) => {
    if (!decks[deckId]) return;

    const card = decks[deckId].find(c => c.id === cardId);
    if (!card) return;

    console.log(`[card:play] プレイヤー ${playerId} がカード ${card.name} を使用`);

    if (card.onPlay) card.onPlay({ playerId, addScore });

    if (playerId) {
      const player = players.find(p => p.id === playerId);
      if (player && player.cards) player.cards = player.cards.filter(c => c.id !== cardId);
    }

    card.location = "field";
    drawnCards[deckId].push(card);

    io.emit(`deck:update:${deckId}`, {
      currentDeck: decks[deckId].filter(c => c.location === "deck"),
      drawnCards: drawnCards[deckId]
    });
    io.emit("players:update", players);
  });

  // サイコロ
  socket.on("dice:roll", ({ diceId, sides }) => {
    const value = Math.floor(Math.random() * sides) + 1;
    console.log(`[dice:roll] サイコロ ${diceId} の出目: ${value}`);
    io.emit(`dice:rolled:${diceId}`, value);
  });

  // タイマー
  socket.on("timer:start", (duration) => {
    let remaining = duration;
    console.log(`[timer:start] タイマー開始: ${duration} 秒`);
    io.emit("timer:start", duration);

    const interval = setInterval(() => {
      remaining--;
      io.emit("timer:update", remaining);
      if (remaining <= 0) {
        clearInterval(interval);
        console.log("[timer:end] タイマー終了");
        io.emit("timer:end");
      }
    }, 1000);
  });

  // ターン更新
  socket.on("game:next-turn", () => {
    currentTurnIndex = (currentTurnIndex + 1) % players.length;
    console.log(`[game:next-turn] 次のターン: ${players[currentTurnIndex]?.name}`);
    io.emit("game:turn", players[currentTurnIndex]?.id);
  });

  // 切断
  socket.on("disconnect", () => {
    console.log(`[disconnect] プレイヤー切断: ${socket.id}`);
    players = players.filter(p => p.id !== socket.id);

    if (currentTurnIndex >= players.length) currentTurnIndex = 0;
    console.log(`[disconnect] 現在のターン: ${players[currentTurnIndex]?.name}`);

    io.emit("game:turn", players[currentTurnIndex]?.id);
    io.emit("players:update", players);
  });
});

httpServer.listen(3000, () => {
  console.log("Socket.IO サーバーがポート3000で起動しました");
});
