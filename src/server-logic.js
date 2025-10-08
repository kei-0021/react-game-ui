// react-game-ui/server-logic.js

// --------------------
// Socket.IO ゲームサーバーロジック
// --------------------

// ログ出力カテゴリ設定（true=出力, false=非表示）
const LOG_CATEGORIES = {
  connection: true,
  deck: false,
  card: true,
  game: true,
  dice: true,
  timer: true,
  addScore: true,
  disconnect: true,
};

// 共通ログ関数
function server_log(tag, ...args) {
  if (!LOG_CATEGORIES[tag]) return;
  console.log(`[${tag}]`, ...args);
}

export function initGameServer(io, options = {}) {
  const decks = {};
  const drawnCards = {};
  let players = [];
  let currentTurnIndex = 0;
  const cardEffects = options.cardEffects || {};
  const initialDecks = options.initialDecks || [];

  console.log("サーバーに渡ってきた cardEffects:", cardEffects);
  console.log("サーバーに渡ってきた initialDecks:", initialDecks);

  // 初期デッキを登録
  initialDecks.forEach(({ deckId, name, cards }) => {
    decks[deckId] = cards.map(c => ({
      ...c,
      deckId,
      location: "deck",
      onPlay: cardEffects[c.name] || (() => {}),
    }));
    drawnCards[deckId] = [];
    console.log(`[deck] デッキ "${name}" (${deckId}) 初期化完了`);
  });

  // スコア加算関数
  function addScore(playerId, points) {
    const player = players.find(p => p.id === playerId);
    if (!player) return;
    player.score = (player.score || 0) + points;
    server_log("addScore", `${player.name} に ${points} ポイント加算`);
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
    server_log("deck", `デッキ ${deckId} をシャッフルしました`);
  }

  // --------------------
  // Socket.IO 接続
  // --------------------
  io.on("connection", socket => {
    server_log("connection", `クライアント接続: ${socket.id}`);

    const newPlayer = { id: socket.id, name: `Player ${players.length + 1}`, cards: [], score: 0 };
    players.push(newPlayer);
    server_log("connection", `新規プレイヤー追加:`, newPlayer);
    socket.emit("player:assign-id", newPlayer.id);
    io.emit("players:update", players);
    io.emit("game:turn", players[currentTurnIndex]?.id);

    // 初期デッキをクライアントに送信
    initialDecks.forEach(({ deckId, name }) => {
      io.emit(`deck:init:${deckId}`, {
        currentDeck: decks[deckId].filter(c => c.location === "deck"),
        drawnCards: drawnCards[deckId],
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
          card.isFaceUp = true;
          player.cards.push(card);
        }
      } else {
        card.location = "field";
        drawnCards[deckId].push(card);
      }

      decks[deckId] = currentDeck.concat(decks[deckId].filter(c => c.location !== "deck"));
      server_log("deck", `デッキ ${deckId} からカードを引きました:`, card);

      io.emit(`deck:update:${deckId}`, {
        currentDeck: decks[deckId].filter(c => c.location === "deck"),
        drawnCards: drawnCards[deckId],
      });
      io.emit("players:update", players);
    });

    // デッキシャッフル
    socket.on("deck:shuffle", ({ deckId }) => {
      shuffleDeck(deckId);
      server_log("deck", `デッキ ${deckId} シャッフル`);
      io.emit(`deck:update:${deckId}`, {
        currentDeck: decks[deckId].filter(c => c.location === "deck"),
        drawnCards: drawnCards[deckId],
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
      server_log("deck", `デッキ ${deckId} リセット`);
      io.emit(`deck:update:${deckId}`, {
        currentDeck: decks[deckId].filter(c => c.location === "deck"),
        drawnCards: drawnCards[deckId],
      });
    });

    // カード使用
    socket.on("card:play", ({ deckId, cardId, playerId }) => {
      if (!decks[deckId]) return;

      const card = decks[deckId].find(c => c.id === cardId);
      if (!card) return;

      server_log("card", `プレイヤー ${playerId} がカード ${card.name} を使用`);
      server_log("card", `カード名: "${card.name}"`);
      server_log("card", "cardEffects keys:", Object.keys(cardEffects));
      
      // ✅ ここを修正！
      const effect = cardEffects[card.name];
      if (effect) {
        server_log("card", `カード効果発揮: ${card.name} by ${playerId}`);
        effect({ playerId, addScore });
      } else {
        server_log("card", `カード効果なし: ${card.name} by ${playerId}`);
      }

      // 残りの処理はそのまま
      if (playerId) {
        const player = players.find(p => p.id === playerId);
        if (player && player.cards)
          player.cards = player.cards.filter(c => c.id !== cardId);
      }

      card.location = "field";
      drawnCards[deckId].push(card);

      io.emit(`deck:update:${deckId}`, {
        currentDeck: decks[deckId].filter(c => c.location === "deck"),
        drawnCards: drawnCards[deckId],
      });
      io.emit("players:update", players);
    });

    socket.on("dice:roll", ({ diceId, sides }) => {
      const value = Math.floor(Math.random() * sides) + 1;
      server_log("dice", `サイコロ ${diceId} の出目: ${value}`);
      io.emit(`dice:rolled:${diceId}`, value);
    });

    socket.on("timer:start", (duration) => {
      let remaining = duration;
      server_log("timer", `タイマー開始: ${duration} 秒`);
      io.emit("timer:start", duration);

      const interval = setInterval(() => {
        remaining--;
        io.emit("timer:update", remaining);
        if (remaining <= 0) {
          clearInterval(interval);
          server_log("timer", "タイマー終了");
          io.emit("timer:end");
        }
      }, 1000);
    });

    socket.on("game:next-turn", () => {
      currentTurnIndex = (currentTurnIndex + 1) % players.length;
      server_log("game", `次のターン: ${players[currentTurnIndex]?.name}`);
      io.emit("game:turn", players[currentTurnIndex]?.id);
    });

    socket.on("disconnect", () => {
      server_log("disconnect", `プレイヤー切断: ${socket.id}`);
      players = players.filter((p) => p.id !== socket.id);

      if (currentTurnIndex >= players.length) currentTurnIndex = 0;
      server_log("disconnect", `現在のターン: ${players[currentTurnIndex]?.name}`);

      io.emit("game:turn", players[currentTurnIndex]?.id);
      io.emit("players:update", players);
    });
  });
}
