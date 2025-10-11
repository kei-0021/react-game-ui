// react-game-ui/server-logic.js

// --------------------
// Socket.IO ゲームサーバーロジック
// --------------------

// ログ出力カテゴリ設定（true=出力, false=非表示）
// let に変更して、initGameServer 関数内で上書きできるようにする
let LOG_CATEGORIES = {
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
  // === ログ設定の初期化 (追加) ===
  if (options.initialLogCategories) {
    // 既存のカテゴリ設定とマージして上書きを許可
    LOG_CATEGORIES = { 
        ...LOG_CATEGORIES, 
        ...options.initialLogCategories 
    };
    console.log("[log] ログカテゴリをオプションで初期化しました。", LOG_CATEGORIES);
  }
  // =============================
    
  const decks = {};
  const drawnCards = {};
  const playFieldCards = {};
  const discardPile = {}; 
  let players = [];
  let currentTurnIndex = 0;
  const initialDecks = options.initialDecks || [];
  const cardEffects = options.cardEffects || {};

  // console.log("サーバーに渡ってきた initialDecks:", initialDecks);
  // console.log("サーバーに渡ってきた cardEffects:", cardEffects);

  // 初期デッキを登録
  initialDecks.forEach(({ deckId, name, cards, backColor }) => {
    decks[deckId] = cards.map(c => ({
      ...c,
      deckId,
      backColor: backColor,
      onPlay: cardEffects[c.name] || (() => {}),
      location: "deck", // すべてのカードの初期位置を 'deck' に設定
    }));
    drawnCards[deckId] = [];
    playFieldCards[deckId] = [];
    discardPile[deckId] = []; // discardPileも初期化
    server_log("deck", `デッキ "${name}" (${deckId}) 初期化完了`);
  });

  // 共通関数：Deck 状態をクライアントに送信
  function emitDeckUpdate(deckId) {
    io.emit(`deck:update:${deckId}`, {
      // 常に location が "deck" のカードだけを山札として送信
      currentDeck: decks[deckId].filter(c => c.location === "deck"), 
      drawnCards: drawnCards[deckId],
      playFieldCards: playFieldCards[deckId],
      discardPile: discardPile[deckId],
    });
    io.emit("players:update", players);
  }

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
    
    // 修正: location が "deck" のカードのみをシャッフル対象とする
    const currentDeck = decks[deckId].filter(c => c.location === "deck");
    const otherCards = decks[deckId].filter(c => c.location !== "deck"); // 手札、場など
    
    // Fisher-Yates シャッフル
    for (let i = currentDeck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [currentDeck[i], currentDeck[j]] = [currentDeck[j], currentDeck[i]];
    }
    
    // シャッフルされた山札と、場や手札のカードを再結合
    decks[deckId] = currentDeck.concat(otherCards); 
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

    // ログ設定の変更を受け付ける (動的変更)
    socket.on("log:set-category", ({ category, enabled }) => {
        if (LOG_CATEGORIES.hasOwnProperty(category)) {
            LOG_CATEGORIES[category] = enabled;
            console.log(`[log] カテゴリ "${category}" のログ出力を ${enabled ? '有効' : '無効'} に設定しました。`);
        } else {
            console.warn(`[log] 未知のログカテゴリ "${category}" が指定されました。`);
        }
    });

    // 初期デッキをクライアントに送信
    initialDecks.forEach(({ deckId, name }) => {
      io.emit(`deck:init:${deckId}`, {
        currentDeck: decks[deckId].filter(c => c.location === "deck"),
        drawnCards: drawnCards[deckId],
      });
    });

    // カードを引く
    socket.on("deck:draw", ({ deckId, playerId, drawLocation = "hand" }) => {
      if (!decks[deckId]) return;

      const currentDeck = decks[deckId].filter(c => c.location === "deck");
      if (!currentDeck.length) return;

      // シャッフルされている currentDeck の先頭のカードIDを取得
      const cardToDrawId = currentDeck[0].id; 
      
      // decks配列全体からカードオブジェクトを見つけ、場所を更新
      const cardIndex = decks[deckId].findIndex(c => c.id === cardToDrawId);
      if (cardIndex === -1) return;

      // decksからは削除せず、locationを更新する方が状態管理しやすいが、
      // 以前のコードが splice を使用していたため、ここでは `location` を更新し、
      // `currentDeck` をフィルターで再構築する方法に戻します。
      const card = decks[deckId][cardIndex]; // カードオブジェクトを取得

      // 移動先の配列に追加
      if (playerId) {
        const player = players.find(p => p.id === playerId);
        if (player) {
          player.cards = player.cards || [];
          card.location = drawLocation;
          card.isFaceUp = true;
          player.cards.push(card);
        }
      } else {
        card.location = drawLocation || "field";
        drawnCards[deckId].push(card);
      }

      server_log("deck", `デッキ ${deckId} からカードを引きました:`, card);

      emitDeckUpdate(deckId);

      io.emit("players:update", players);
    });

    // デッキシャッフル
    socket.on("deck:shuffle", ({ deckId }) => {
      shuffleDeck(deckId);
      server_log("deck", `デッキ ${deckId} シャッフル`);
      
      // 更新されたデッキの状態を送信
      emitDeckUpdate(deckId);
    });

    // デッキリセット
    socket.on("deck:reset", ({ deckId }) => {
      if (!decks[deckId]) return;

      // 場のカード、捨て札、引いたカードをすべて山札に戻す
      decks[deckId].forEach(c => {
          c.location = "deck";
          c.isFaceUp = false;
      });

      // 配列を空にする
      drawnCards[deckId] = [];
      playFieldCards[deckId] = [];
      discardPile[deckId] = [];

      shuffleDeck(deckId);
      server_log("deck", `デッキ ${deckId} リセット`);
      
      // 更新されたデッキの状態を送信
      emitDeckUpdate(deckId);
    });

    // カード使用（単一 or 複数対応）
    socket.on("card:play", ({ deckId, cardIds, playerId, playLocation = "field" }) => {
      if (!decks[deckId]) return;

      // cardIds が単数の場合も配列に変換
      const ids = Array.isArray(cardIds) ? cardIds : [cardIds];

      ids.forEach((cardId) => {
        const card = decks[deckId].find(c => c.id === cardId);
        if (!card) return;

        // ------------------------------------
        // 修正ポイント 1: 元の配列からの削除
        // ------------------------------------
        
        // プレイヤーの手札から削除
        if (playerId) {
          const player = players.find(p => p.id === playerId);
          if (player && player.cards) {
            player.cards = player.cards.filter(c => c.id !== cardId);
          }
        }
        
        // ** drawnCards から削除 ** (手札からの移動ではない場合)
        const drawnIndex = drawnCards[deckId].findIndex(c => c.id === cardId);
        if (drawnIndex !== -1) {
            drawnCards[deckId].splice(drawnIndex, 1);
        }
        
        // ** playFieldCards から削除 ** (場からの移動ではない場合)
        const fieldIndex = playFieldCards[deckId].findIndex(c => c.id === cardId);
        if (fieldIndex !== -1) {
            playFieldCards[deckId].splice(fieldIndex, 1);
        }

        // ** discardPile から削除 ** (捨て札からの移動ではない場合)
        const discardIndex = discardPile[deckId].findIndex(c => c.id === cardId);
        if (discardIndex !== -1) {
            discardPile[deckId].splice(discardIndex, 1);
        }
        
        // ------------------------------------
        // 修正ポイント 2: 新しい場所の配列への追加
        // ------------------------------------

        // カードの新しい場所を反映 (location プロパティ)
        card.location = playLocation;
        card.isFaceUp = true;
        
        server_log("card", `プレイヤー ${playerId} がカード ${card.name} を使用`);
        
        // 効果発動
        const effect = cardEffects[card.name];
        if (effect) {
          server_log("card", `カード効果発揮: ${card.name} by ${playerId}`);
          effect({ playerId, addScore });
        } else {
          server_log("card", `カード効果なし: ${card.name} by ${playerId}`);
        }

        server_log("card", `[${playLocation}] へ移動しました`);

        // 配列を playLocation に応じて振り分け (新しい場所に追加)
        if (playLocation === "deck") {
          // deck に戻す場合は配列に追加する必要はない (emitDeckUpdateのfilterで処理される)
        } else if (playLocation === "field") {
          playFieldCards[deckId].push(card);
        } else if (playLocation === "discard") {
          discardPile[deckId].push(card);
        }
      });

      // まとめて更新をクライアントへ送信
      emitDeckUpdate(deckId);
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
