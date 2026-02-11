import {
  applyCellEffect,
  createRandomBoard,
  generateColorFromId,
  LOG_CATEGORIES,
  markCellAsExplored,
  MockGameState,
  server_log,
  unmarkCellAsExplored,
} from "./server-utils.js";

// ------------------------------------
// ルームの状態管理
// ------------------------------------

/** @typedef {import('./server-utils.js').RoomGameInfo} RoomGameInfo */
/** @typedef {import('./server-utils.js').GameState} GameState */

/** @type {Map<string, RoomGameInfo>} */
const activeRooms = new Map();

/**
 * ルームの基本的なメタ情報を取得する
 * @param {string} roomId
 * @returns {object | null}
 */
function getRoomMeta(roomId) {
  const roomInfo = activeRooms.get(roomId);
  if (!roomInfo) return null;

  const gameStateInstance = roomInfo.gameStateInstance;

  return {
    id: roomId,
    gameName: roomInfo.gameName,
    playerCount: gameStateInstance.players.length,
    maxPlayers: 4,
    createdAt: roomInfo.createdAt,
  };
}

/**
 * ルームのゲームロジックを初期化する
 * @param {string} roomId
 * @param {object} options
 * @returns {RoomGameInfo}
 */
function initializeRoom(roomId, settings) {
  const initialDecks = settings.initialDecks || [];
  const initialResources = settings.initialResources || [];
  const initialTokenStores = Array.isArray(settings.initialTokenStore)
    ? settings.initialTokenStore
    : [];
  const initialTokens = settings.initialTokens || [];
  const initialBoard = settings.initialBoard || [];

  const Cells = createRandomBoard(initialBoard);

  const initialState = {
    players: [],
    initialResources: initialResources,
    initialTokenStores: initialTokenStores,
    initialTokens: initialTokens,
    board: Cells,
    exploredCells: [],
    turn: 1,
  };

  const gameStateInstance = new MockGameState(initialState, initialTokenStores);

  const decks = {};
  const drawnCards = {};
  const playFieldCards = {};
  const discardPile = {};

  // デッキの初期化ループ
  initialDecks.forEach((deckConfig) => {
    // deckConfig.cards が正しく渡ってきているか
    const cards = (deckConfig.cards || []).map((c, index) => ({
      ...c,
      deckId: deckConfig.deckId,
      backColor: deckConfig.backColor,
      instanceId: `${roomId}_${deckConfig.deckId}_${index}`,
      location: "deck",
      ownerId: null,
    }));

    decks[deckConfig.deckId] = cards;
    drawnCards[deckConfig.deckId] = [];
    playFieldCards[deckConfig.deckId] = [];
    discardPile[deckConfig.deckId] = [];

    server_log(
      "deck",
      `[${roomId}] デッキ "${deckConfig.name}" (${deckConfig.deckId}) 初期化完了`,
    );
  });

  const roomInfo = {
    roomId,
    createdAt: Date.now(),
    gameName: settings.name || "不明なゲーム",
    currentTurnIndex: 0,
    currentRoundIndex: 0,
    decks,
    drawnCards,
    playFieldCards,
    discardPile,
    gameStateInstance,
  };

  activeRooms.set(roomId, roomInfo);
  server_log(
    "room",
    `ルーム ${roomId} を初期化し、アクティブリストに追加しました。`,
  );

  return roomInfo;
}

export function initGameServer(io, options = {}) {
  const gamePresets = options.gamePresets || {};

  // === ログ設定の初期化 ===
  if (options.initialLogCategories) {
    // server-utils.js の LOG_CATEGORIES を更新
    Object.assign(LOG_CATEGORIES, options.initialLogCategories);
    console.log(
      "[log] ログカテゴリをオプションで初期化しました。",
      LOG_CATEGORIES,
    );
  }
  // =============================

  const initialHand = options.initialHand || {};
  const cellEffects = options.cellEffects || {};

  // ------------------------------------
  // ヘルパー関数の定義 (特定のルームに限定)
  // ------------------------------------

  /**
   * Deck 状態をルーム内のクライアントに送信
   * @param {string} roomId
   * @param {string} deckId
   */
  function emitDeckUpdate(roomId, deckId) {
    const roomInfo = activeRooms.get(roomId);
    if (!roomInfo) return;

    io.to(roomId).emit(`deck:update:${roomId}:${deckId}`, {
      currentDeck: roomInfo.decks[deckId].filter((c) => c.location === "deck"),
      drawnCards: roomInfo.drawnCards[deckId],
      playFieldCards: roomInfo.playFieldCards[deckId],
      discardPile: roomInfo.discardPile[deckId],
    });
    io.to(roomId).emit("players:update", roomInfo.gameStateInstance.players);
  }

  /**
   * Player 状態をルーム内のクライアントに送信
   * @param {string} roomId
   */
  function emitPlayerUpdate(roomId) {
    const roomInfo = activeRooms.get(roomId);
    if (!roomInfo) return;
    io.to(roomId).emit("players:update", roomInfo.gameStateInstance.players);
  }

  /**
   * 探索済みマス目リストをルーム内のクライアントにブロードキャスト
   * @param {string} roomId
   */
  const broadcastExploredUpdate = (roomId) => {
    const roomInfo = activeRooms.get(roomId);
    if (!roomInfo) return;

    io.to(roomId).emit(
      "board-update",
      roomInfo.gameStateInstance.exploredCells,
    );
    server_log(
      "cell",
      `[${roomId}] Explored cells updated and broadcasted. Total: ${roomInfo.gameStateInstance.exploredCells.length}`,
    );
  };

  /**
   * スコア加算関数
   * @param {string} roomId
   * @param {string} playerId
   * @param {number} points
   */
  function addScore(roomId, playerId, points) {
    const roomInfo = activeRooms.get(roomId);
    if (!roomInfo) return;

    const player = roomInfo.gameStateInstance.players.find(
      (p) => p.id === playerId,
    );
    if (!player) return;
    player.score = (player.score || 0) + points;
    server_log(
      "addScore",
      `[${roomId}] ${player.name} に ${points} ポイント加算`,
    );
    emitPlayerUpdate(roomId);
  }

  /**
   * 統一された汎用リソース更新関数
   * @param {string} roomId
   * @param {string} playerId
   * @param {string} resourceId
   * @param {number} amount
   * @returns {boolean}
   */
  function updatePlayerResource(roomId, playerId, resourceId, amount) {
    const roomInfo = activeRooms.get(roomId);
    if (!roomInfo) return false;

    const player = roomInfo.gameStateInstance.players.find(
      (p) => p.id === playerId,
    );
    if (!player || !player.resources) return false;

    const resource = player.resources.find((r) => r.id === resourceId);
    if (!resource) {
      server_log(
        "warn",
        `[${roomId}] リソースID "${resourceId}" が見つかりません。`,
      );
      return false;
    }

    const newValue = resource.currentValue + amount;
    resource.currentValue = Math.min(resource.maxValue, Math.max(0, newValue));

    server_log(
      "resource",
      `[${roomId}] ${player.name}: ${resource.name} を ${
        amount > 0 ? "+" : ""
      }${amount}、現在値: ${resource.currentValue}`,
    );

    emitPlayerUpdate(roomId);
    return true;
  }

  /**
   * 統一された汎用トークン更新関数 (カウント更新)
   * @param {string} roomId
   * @param {string} playerId
   * @param {string} tokenId
   * @param {number} amount
   * @returns {boolean}
   */
  function updatePlayerToken(roomId, playerId, tokenId, amount) {
    const roomInfo = activeRooms.get(roomId);
    if (!roomInfo) return false;

    const player = roomInfo.gameStateInstance.players.find(
      (p) => p.id === playerId,
    );
    if (!player || !player.tokens) return false;

    const token = player.tokens.find((t) => t.id === tokenId);
    if (!token) {
      server_log(
        "warn",
        `[${roomId}] トークンID "${tokenId}" がプレイヤーのインベントリに見つかりません。`,
      );
      return false;
    }

    const newValue = (token.count || 0) + amount;
    token.count = Math.max(0, newValue);

    server_log(
      "token",
      `[${roomId}] ${player.name}: ${token.name || tokenId} を ${
        amount > 0 ? "+" : ""
      }${amount}、現在枚数: ${token.count}`,
    );

    emitPlayerUpdate(roomId);
    return true;
  }

  // ------------------------------------
  // サーバー全体でルームごとのタイマーを管理
  // ------------------------------------
  /** @type {Map<string, NodeJS.Timeout>} */
  const roomTimers = new Map();

  /**
   * ルーム内の全クライアントにポップアップ表示を要求
   * @param {string} roomId
   * @param {string} message
   * @param {string} color
   */
  function requirePopup(roomId, message, color = "blue") {
    const popupContent = {
      message: message,
      color: color,
      timestamp: Date.now(),
    };
    server_log(
      "popup",
      `[${roomId}] 全員にポップアップ要求: ${message} (色: ${color})`,
    );
    io.to(roomId).emit("client:show-popup", popupContent);
  }

  // デッキをシャッフル
  function shuffleDeck(roomId, deckId) {
    const roomInfo = activeRooms.get(roomId);
    if (!roomInfo || !roomInfo.decks[deckId]) return;

    const decks = roomInfo.decks;

    const currentDeck = decks[deckId].filter((c) => c.location === "deck");
    const otherCards = decks[deckId].filter((c) => c.location !== "deck");

    // Fisher-Yates シャッフル
    for (let i = currentDeck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [currentDeck[i], currentDeck[j]] = [currentDeck[j], currentDeck[i]];
    }

    // シャッフルしたデッキと、手札/フィールド/捨て札を結合
    const shuffledDeck = currentDeck.concat(otherCards);
    // 全体のカードリストを更新（locationのプロパティは維持）
    roomInfo.decks[deckId] = shuffledDeck;

    server_log("deck", `[${roomId}] デッキ ${deckId} をシャッフル`);
  }

  // --------------------
  // Socket.IO 接続
  // --------------------
  io.on("connection", (socket) => {
    // 1. ロビー機能: アクティブルームリストの取得
    socket.on("lobby:get-rooms", () => {
      server_log(
        "lobby",
        `クライアント ${socket.id} からルームリスト要求を受信。`,
      );

      const roomList = Array.from(activeRooms.keys())
        .map(getRoomMeta)
        .filter((meta) => meta !== null);

      socket.emit("lobby:rooms-list", roomList);
    });

    // 2. ルーム参加処理
    socket.on("room:join", async ({ roomId, playerName, gamePresetId }) => {
      if (!roomId || typeof roomId !== "string") {
        server_log(
          "warn",
          `Client ${socket.id} が不正な roomId: ${roomId} で join を試行しました。初期化をスキップします。`,
        );
        return;
      }

      const providedName =
        typeof playerName === "string" && playerName.trim().length > 0
          ? playerName.trim()
          : null;

      server_log(
        "room",
        `[${roomId}][${gamePresetId}] Client ${
          socket.id
        } が join リクエストを送信 (Name: ${providedName || "N/A"})`,
      );

      // --- ルーム情報の取得または作成 ---
      let roomInfo = activeRooms.get(roomId);

      // プリセットIDに基づいて設定を取得（未定義ならデフォルトのoptionsを使用）
      const roomSettings = gamePresets[gamePresetId] || options;

      if (!roomInfo) {
        // 適切な roomSettings で初期化
        if (!roomSettings.name) {
          roomSettings.name = gamePresetId || "default";
        }

        // initializeRoom の内部で activeRooms.set(roomId, roomInfo) が実行される
        roomInfo = initializeRoom(roomId, roomSettings);

        // デッキが存在する場合のみシャッフルを実行
        if (roomInfo.decks && typeof roomInfo.decks === "object") {
          Object.keys(roomInfo.decks).forEach((deckId) => {
            // デッキの中身が配列であり、かつ中身がある場合のみ
            if (
              Array.isArray(roomInfo.decks[deckId]) &&
              roomInfo.decks[deckId].length > 0
            ) {
              shuffleDeck(roomId, deckId);
            }
          });
        }

        io.emit("lobby:room-update");
      }

      await socket.join(roomId);

      const { gameStateInstance, decks, currentTurnIndex } = roomInfo;
      const existingPlayer = gameStateInstance.players.find(
        (p) => p.socketId === socket.id,
      );

      if (!existingPlayer) {
        // --- 新規プレイヤー作成 ---
        const playerId = `${roomId}_p${gameStateInstance.players.length + 1}`;
        const playerColor = generateColorFromId(playerId);

        const newPlayer = {
          id: playerId,
          name:
            providedName || `Player ${gameStateInstance.players.length + 1}`,
          color: playerColor,
          socketId: socket.id,
          cards: [],
          score: 0,
          resources: Array.isArray(roomSettings.initialResources)
            ? JSON.parse(JSON.stringify(roomSettings.initialResources))
            : [],
          tokens: Array.isArray(roomSettings.initialTokens)
            ? JSON.parse(JSON.stringify(roomSettings.initialTokens))
            : [],
          position: { row: 0, col: 0 },
        };

        gameStateInstance.players.push(newPlayer);
        socket.emit("player:assign-id", newPlayer.id);

        // 初期手札の配布
        const handConfig = roomSettings.initialHand;

        if (
          handConfig &&
          handConfig.deckId &&
          handConfig.count > 0 &&
          decks[handConfig.deckId]
        ) {
          const targetDeck = decks[handConfig.deckId];
          let cardsDealt = 0;

          for (let i = 0; i < handConfig.count; i++) {
            // デッキ（location="deck"）の状態にあるカードを上から探す
            const cardIndex = targetDeck.findIndex(
              (c) => c.location === "deck",
            );
            if (cardIndex === -1) break;

            const card = targetDeck[cardIndex];
            card.location = "hand";
            card.isFaceUp = true;
            card.ownerId = newPlayer.id;
            newPlayer.cards.push(card);
            cardsDealt++;
          }
          server_log(
            "deck",
            `[${roomId}] 初期手札を ${cardsDealt}枚 配布しました (Preset: ${gamePresetId})`,
          );
        }
      } else {
        existingPlayer.socketId = socket.id;
        socket.emit("player:assign-id", existingPlayer.id);
      }

      // --- 同期処理（本人のみに送信） ---
      if (gameStateInstance.board && gameStateInstance.board.length > 0) {
        socket.emit("game:init-board", gameStateInstance.board);
      }

      gameStateInstance.tokenStores.forEach((store) => {
        socket.emit(
          `token-store:init:${roomId}:${store.id}`,
          store.getTokens(),
        );
      });

      Object.keys(decks).forEach((deckId) => {
        socket.emit(`deck:init:${deckId}`, {
          currentDeck: decks[deckId].filter((c) => c.location === "deck"),
          drawnCards: roomInfo.drawnCards[deckId],
        });
        emitDeckUpdate(roomId, deckId);
      });

      emitPlayerUpdate(roomId);
      io.to(roomId).emit("game:turn", {
        playerId: gameStateInstance.players[currentTurnIndex]?.id,
        currentRound: roomInfo.currentRoundIndex,
        currentTurnIndex: currentTurnIndex,
      });

      if (gameStateInstance.exploredCells.length > 0) {
        socket.emit("board-update", gameStateInstance.exploredCells);
      }
    });

    // スコア加算
    socket.on("room:player:add-score", ({ roomId, targetPlayerId, points }) => {
      const roomInfo = activeRooms.get(roomId);
      if (!roomInfo) return;

      addScore(roomId, targetPlayerId, points);
    });

    socket.on(
      "room:player:update-resource",
      ({ roomId, playerId, resourceId, amount }) => {
        const roomInfo = activeRooms.get(roomId);
        if (!roomInfo) return;

        updatePlayerResource(roomId, playerId, resourceId, amount);
      },
    );

    // 2.5. カスタムイベントの登録
    const events = options.customEvents ? options.customEvents() : {};
    for (const [event, handler] of Object.entries(events)) {
      socket.on(event, (data) => {
        server_log("custom_event", `${event} received from ${socket.id}`, data);
        try {
          handler(socket, data);
        } catch (err) {
          server_log("warning", `${event} handler error:`, err);
        }
      });
    }

    // 3. プレイヤーの移動処理
    socket.on("game:move-player", ({ roomId, playerId, newPosition }) => {
      const roomInfo = activeRooms.get(roomId);
      if (!roomInfo) {
        server_log(
          "warn",
          `[${roomId}] ルームが見つかりません for move-player`,
        );
        return;
      }

      const { gameStateInstance } = roomInfo;
      const playerToMove = gameStateInstance.players.find(
        (p) => p.id === playerId,
      );

      if (playerToMove) {
        playerToMove.position = newPosition;
        server_log(
          "game",
          `[${roomId}] Player ${playerToMove.name} moved to (${newPosition.row}, ${newPosition.col})`,
        );

        const wasUpdated = markCellAsExplored(gameStateInstance, newPosition);

        // applyCellEffect の引数にヘルパー関数をバインドして渡す
        applyCellEffect(
          gameStateInstance,
          playerId,
          newPosition,
          cellEffects,
          (pId, pts) => addScore(roomId, pId, pts),
          (pId, rId, amt) => updatePlayerResource(roomId, pId, rId, amt),
          (pId, tId, amt) => updatePlayerToken(roomId, pId, tId, amt),
          (msg, color) => requirePopup(roomId, msg, color),
        );

        emitPlayerUpdate(roomId);

        if (wasUpdated) {
          broadcastExploredUpdate(roomId);
        }
      } else {
        server_log(
          "warn",
          `[${roomId}] Move requested for unknown player ID: ${playerId}`,
        );
      }
    });

    // 4. マス目探索処理 (roomIdを要求)
    socket.on("game:explore-cell", ({ roomId, playerId, targetPosition }) => {
      const roomInfo = activeRooms.get(roomId);
      if (!roomInfo) {
        server_log(
          "warn",
          `[${roomId}] ルームが見つかりません for explore-cell`,
        );
        return;
      }

      const { gameStateInstance } = roomInfo;
      const player = gameStateInstance.players.find((p) => p.id === playerId);
      const { row, col } = targetPosition;

      if (player) {
        server_log(
          "game",
          `[${roomId}] Player ${player.name} exploring cell at (${row}, ${col})`,
        );

        const wasUpdated = markCellAsExplored(
          gameStateInstance,
          targetPosition,
        );

        emitPlayerUpdate(roomId);

        if (wasUpdated) {
          broadcastExploredUpdate(roomId);
        }
      } else {
        server_log(
          "warn",
          `[${roomId}] Explore requested for unknown player ID: ${playerId}`,
        );
      }
    });

    socket.on("game:unexplore-cell", ({ roomId, targetPosition }) => {
      const roomInfo = activeRooms.get(roomId);
      if (!roomInfo) {
        server_log(
          "warn",
          `[${roomId}] ルームが見つかりません for unexplore-cell`,
        );
        return;
      }

      const wasRemoved = unmarkCellAsExplored(
        roomInfo.gameStateInstance,
        targetPosition,
      );

      emitPlayerUpdate(roomId);

      if (wasRemoved) {
        broadcastExploredUpdate(roomId);
      }
    });

    // 💡 修正箇所: 5. ダイスロール要求の処理 (イベント名をクライアント側の期待値に合わせる)
    socket.on("dice:roll", ({ roomId, diceId, sides }) => {
      const roomInfo = activeRooms.get(roomId);
      if (!roomInfo) {
        server_log("warn", `[${roomId}] ルームが見つかりません for dice-roll`);
        return;
      }

      // 乱数生成: 1からsidesまでの整数
      const rollValue = Math.floor(Math.random() * sides) + 1;

      server_log(
        "game",
        `[${roomId}] Dice ${diceId} rolled D${sides}. Result: ${rollValue}`,
      );

      // 💡 修正: ルーム内の全員に結果を、ユニークなイベント名でブロードキャスト
      // クライアントの Dice.js が期待するイベント名: `dice:rolled:${roomId}:${diceId}`
      io.to(roomId).emit(`dice:rolled:${roomId}:${diceId}`, rollValue);

      // TODO: ゲームロジック側で、このロール結果をプレイヤーの移動や行動に反映する
    });

    // ログ設定の変更を受け付ける
    socket.on("log:set-category", ({ category, enabled }) => {
      if (LOG_CATEGORIES.hasOwnProperty(category)) {
        LOG_CATEGORIES[category] = enabled;
        console.log(
          `[log] カテゴリ "${category}" のログ出力を ${
            enabled ? "有効" : "無効"
          } に設定しました。`,
        );
      } else {
        console.warn(
          `[log] 未知のログカテゴリ "${category}" が指定されました。`,
        );
      }
    });

    // カードを引く
    socket.on(
      "deck:draw",
      ({ roomId, deckId, playerId, drawLocation = "hand" }) => {
        const roomInfo = activeRooms.get(roomId);
        if (!roomInfo || !roomInfo.decks[deckId]) {
          server_log(
            "warn",
            `[${roomId}] ルームまたはデッキが見つかりません for draw`,
          );
          return;
        }

        const { decks } = roomInfo;
        // デッキにあるカードのみをフィルタリング
        const currentDeck = decks[deckId].filter((c) => c.location === "deck");
        if (!currentDeck.length) {
          server_log("warn", `[${roomId}] デッキ ${deckId} は空です。`);
          return;
        }

        // 先頭のカードを取得
        const card = currentDeck[0];

        let destination = "";

        // --- 移動ロジック開始 ---

        // A. 引いた瞬間に捨て札にする場合
        if (drawLocation == "discard") {
          card.location = "discard";
          card.ownerId = null;
          card.isFaceUp = true;
          roomInfo.discardPile[deckId].push(card);
          destination = "discard";
        }
        // B. プレイヤーを指定して引く場合
        else if (playerId) {
          const player = roomInfo.gameStateInstance.players.find(
            (p) => p.id === playerId,
          );
          if (player) {
            player.cards = player.cards || [];
            card.location = drawLocation;
            card.isFaceUp = true;
            card.ownerId = playerId;
            player.cards.push(card);
            destination = playerId;
          }
        }
        // C. 場に出す場合
        else {
          card.ownerId = null;
          card.location = "field";
          card.isFaceUp = true;
          roomInfo.playFieldCards[deckId].push(card);
          destination = "field";
        }

        server_log(
          "deck",
          `[${roomId}] DRAW: ${card.name} (ID:${card.id}) (deck -> ${destination})`,
        );

        emitDeckUpdate(roomId, deckId);
        emitPlayerUpdate(roomId);
      },
    );

    // デッキシャッフル
    socket.on("deck:shuffle", ({ roomId, deckId }) => {
      if (!activeRooms.has(roomId)) {
        server_log("warn", `[${roomId}] ルームが見つかりません for shuffle`);
        return;
      }
      shuffleDeck(roomId, deckId);
      emitDeckUpdate(roomId, deckId);
    });

    // デッキリセット（プレイヤーの手札はそのまま）
    socket.on("deck:reset", ({ roomId, deckId }) => {
      const roomInfo = activeRooms.get(roomId);
      if (!roomInfo || !roomInfo.decks[deckId]) {
        server_log(
          "warn",
          `[${roomId}] ルームまたはデッキが見つかりません for reset`,
        );
        return;
      }

      const { decks, playFieldCards, discardPile } = roomInfo;

      // デッキ・プレイフィールド・捨て札のカード位置をリセット
      decks[deckId].forEach((c) => {
        if (c.location === "discard" || c.location === "field") {
          c.location = "deck";
          c.isFaceUp = false;
          c.ownerId = null; // 所有者をクリア
        }
      });

      // 各配列をクリア
      playFieldCards[deckId] = [];
      discardPile[deckId] = [];

      server_log(
        "deck",
        `[${roomId}] デッキ ${deckId} リセット (手札はそのまま)`,
      );
      shuffleDeck(roomId, deckId);
      emitDeckUpdate(roomId, deckId);
    });

    // カード使用
    socket.on(
      "card:play",
      ({ roomId, deckId, cardIds, playerId, playLocation = "field" }) => {
        const roomInfo = activeRooms.get(roomId);
        if (!roomInfo || !roomInfo.decks[deckId]) {
          server_log(
            "warn",
            `[${roomId}] ルームまたはデッキが見つかりません for card:play`,
          );
          return;
        }

        const { decks, playFieldCards, discardPile, gameStateInstance } =
          roomInfo;
        const ids = Array.isArray(cardIds) ? cardIds : [cardIds];

        ids.forEach((cardId) => {
          const card = decks[deckId].find((c) => c.id === cardId);
          if (!card) return;

          // 元の配列からの削除（手札からの削除）
          if (playerId) {
            const player = gameStateInstance.players.find(
              (p) => p.id === playerId,
            );
            if (player && player.cards) {
              player.cards = player.cards.filter((c) => c.id !== cardId);
            }
          }

          // カードの location を更新
          card.location = playLocation;
          card.isFaceUp = true;

          server_log(
            "card",
            `[${roomId}] Play: ${card.name} (ID:${card.id}) (${playerId}  -> ${playLocation})`,
          );

          // プレイフィールド、捨て札リストを更新（サーバー側で状態を追跡するための配列）
          // 既存の場所からの削除と新しい場所への追加を行う
          [playFieldCards[deckId], discardPile[deckId]].forEach((arr) => {
            const index = arr.findIndex((c) => c.id === cardId);
            if (index !== -1) arr.splice(index, 1);
          });

          if (playLocation === "discard") {
            card.ownerId = null;
            discardPile[deckId].push(card);
          } else if (playLocation === "field") {
            playFieldCards[deckId].push(card);
          }

          // 効果発動
          const effect = options.cardEffects[card.name];
          if (effect) {
            server_log(
              "card",
              `[${roomId}] カード効果発揮: ${card.name} by ${playerId}`,
            );
            effect({
              playerId,
              addScore: (points) => addScore(roomId, playerId, points),
              updateResource: (resourceId, amount) =>
                updatePlayerResource(roomId, playerId, resourceId, amount),
              updateToken: (tokenId, amount) =>
                updatePlayerToken(roomId, playerId, tokenId, amount),
            });
          }
        });

        emitDeckUpdate(roomId, deckId);
        emitPlayerUpdate(roomId);
      },
    );

    // フィールドから「手札」または「捨て札」へ移動
    socket.on(
      "card:move-from-field",
      ({ roomId, deckId, cardId, targetPlayerId = null }) => {
        const roomInfo = activeRooms.get(roomId);
        if (!roomInfo) return;

        const { decks, playFieldCards, gameStateInstance } = roomInfo;

        // 対象カードを特定
        const card = decks[deckId]?.find((c) => c.id === cardId);
        if (!card) return;

        // PlayFieldから削除（共通処理）
        const fieldIndex = playFieldCards[deckId]?.findIndex(
          (c) => c.id === cardId,
        );
        if (fieldIndex !== -1) {
          playFieldCards[deckId].splice(fieldIndex, 1);
        }

        // 行き先の判定と処理
        if (targetPlayerId) {
          // --- 手札に戻す場合 ---
          const player = gameStateInstance.players.find(
            (p) => p.id === targetPlayerId,
          );
          if (player) {
            card.location = "hand";
            card.ownerId = targetPlayerId;
            card.isFaceUp = true; // 手札なので自分には見える
            player.cards = player.cards || [];
            player.cards.push(card);

            server_log(
              "card",
              `[${roomId}] Return: ${card.name} -> Player:${targetPlayerId}`,
            );
          }
        } else {
          // --- 捨て札に送る場合 ---
          card.location = "discard";
          card.ownerId = null;
          card.isFaceUp = true;
          roomInfo.discardPile[deckId].push(card);

          server_log("card", `[${roomId}] Return: ${card.name} -> discard`);
        }

        emitDeckUpdate(roomId, deckId);
        emitPlayerUpdate(roomId);
      },
    );

    // トークン獲得イベントのハンドラ（room対応版）
    socket.on("game:acquire-token", (payload) => {
      const { roomId, tokenStoreId, tokenId, tokenName } = payload;

      const roomInfo = activeRooms.get(roomId);
      if (!roomInfo) {
        server_log("warn", `[${roomId}] Room not found.`);
        return;
      }

      const { gameStateInstance } = roomInfo;

      // socket.id からプレイヤーIDを取得
      const player = gameStateInstance.players.find(
        (p) => p.socketId === socket.id,
      );
      if (!player) {
        server_log(
          "warn",
          `[${roomId}] プレイヤーが見つかりません (socket.id: ${socket.id})`,
        );
        return;
      }
      const playerId = player.id;

      server_log(
        "token",
        `[${roomId}] Player ${player.name} attempts to acquire token: ${tokenName} (Store: ${tokenStoreId}, ID: ${tokenId})`,
      );

      const success = gameStateInstance.acquireToken(
        tokenStoreId,
        playerId,
        tokenId,
      );

      if (success) {
        if (tokenStoreId !== "scoreboard-acquisition") {
          const updatedTokens = gameStateInstance
            .getTokenStore(tokenStoreId)
            ?.getTokens();
          if (updatedTokens) {
            io.to(roomId).emit(
              `token-store:update:${roomId}:${tokenStoreId}`,
              updatedTokens,
            );
            server_log(
              "token",
              `[${roomId}] ストア ${tokenStoreId} の更新 (${updatedTokens.length} 個) をブロードキャストしました。`,
            );
          }
        }

        emitPlayerUpdate(roomId);
        io.to(roomId).emit(
          "game:state-update",
          gameStateInstance.getFullState(),
        );
      } else {
        server_log(
          "warn",
          `[${roomId}] Failed to acquire token ${tokenId}. It might not exist or logic failed.`,
        );
        const currentTokens = gameStateInstance
          .getTokenStore(tokenStoreId)
          ?.getTokens();
        if (currentTokens) {
          socket.emit(
            `token-store:update:${roomId}:${tokenStoreId}`,
            currentTokens,
          );
        }
      }
    });

    // ------------------------------------
    // 3. タイマー機能
    // ------------------------------------

    /**
     * ルームのタイマーを停止・クリアする
     * @param {string} roomId
     */
    function stopTimer(roomId) {
      if (roomTimers.has(roomId)) {
        clearTimeout(roomTimers.get(roomId));
        roomTimers.delete(roomId);
        server_log("timer", `[${roomId}] タイマーを停止しました。`);
      }
    }

    /**
     * クライアントからのタイマー開始リクエスト
     * @param {{ duration: number, roomId: string }} data
     */
    socket.on("timer:start", ({ duration, roomId }) => {
      if (!activeRooms.has(roomId)) {
        server_log(
          "warn",
          `[${roomId}] 存在しないルームでタイマー開始リクエストを受信。`,
        );
        return;
      }

      server_log("timer", `[${roomId}] ${duration}秒のタイマーを開始します。`);

      // 既存のタイマーをクリア
      stopTimer(roomId);

      let remainingTime = duration;

      // ルーム内の全クライアントに開始を通知
      io.to(roomId).emit("timer:start", { duration, roomId });

      function tick() {
        if (remainingTime <= 0) {
          // 終了処理
          stopTimer(roomId);
          io.to(roomId).emit("timer:update", { remaining: 0, roomId });
          io.to(roomId).emit("timer:finish", { roomId });
          server_log("timer", `[${roomId}] タイマーが終了しました。`);
          return;
        }

        // 1秒ごとの更新をクライアントにブロードキャスト
        io.to(roomId).emit("timer:update", {
          remaining: remainingTime,
          roomId,
        });
        remainingTime--;

        // 1秒後に次のティックを予約
        const timeoutId = setTimeout(tick, 1000);
        roomTimers.set(roomId, timeoutId);
      }

      // 即座に最初のティックを実行
      tick();
    });

    // 次のターン
    socket.on("game:next-turn", ({ roomId }) => {
      const roomInfo = activeRooms.get(roomId);
      if (!roomInfo) {
        server_log("warn", `[${roomId}] ルームが見つかりません for next-turn`);
        return;
      }

      const { gameStateInstance } = roomInfo;
      const playerCount = gameStateInstance.players.length;
      if (playerCount === 0) return;

      // ターンを更新
      const nextIndex = (roomInfo.currentTurnIndex + 1) % playerCount;

      // ラウンド更新の判定
      if (nextIndex === 0) {
        roomInfo.currentRoundIndex = roomInfo.currentRoundIndex + 1;
      }

      roomInfo.currentTurnIndex = nextIndex;
      const currentPlayer =
        gameStateInstance.players[roomInfo.currentTurnIndex];

      // ログにラウンドとターンを両方出す
      server_log(
        "game",
        `[${roomId}] ターン更新 (Player: ${currentPlayer?.name}, RoundIndex: ${roomInfo.currentRoundIndex}, TurnIndex: ${roomInfo.currentTurnIndex})`,
      );

      // クライアント側でもラウンドを表示したいので、一緒に送る
      io.to(roomId).emit("game:turn", {
        playerId: currentPlayer?.id,
        currentRound: roomInfo.currentRoundIndex,
        currentTurnIndex: roomInfo.currentTurnIndex,
      });
    });

    socket.on("require-popup", ({ roomId, message, color = "blue" }) => {
      server_log(
        "popup",
        `[${roomId}] 全員にポップアップ要求: ${message} (色: ${color})`,
      );

      const popupContent = {
        message: message,
        color: color,
        timestamp: Date.now(),
      };

      io.to(roomId).emit("client:show-popup", popupContent);
    });

    // 接続切断処理
    socket.on("disconnect", async () => {
      server_log("disconnect", `クライアント切断: ${socket.id}`);

      // 1. 切断されたソケットが参加していたゲームルームを特定
      // Socket.IOは切断時に自動でルームを抜けますが、disconnectingイベントで参加していたルームを取得できます。
      // しかし、ここではルーム参加時にプレイヤーオブジェクトにroomIdを保持していないため、
      // activeRooms全体をチェックして、このsocketIdを持つプレイヤーがいたルームを探します。

      let disconnectedRoomId = null;
      let disconnectingPlayer = null;

      for (const [roomId, roomInfo] of activeRooms.entries()) {
        const playerIndex = roomInfo.gameStateInstance.players.findIndex(
          (p) => p.socketId === socket.id,
        );
        if (playerIndex !== -1) {
          disconnectedRoomId = roomId;
          disconnectingPlayer = roomInfo.gameStateInstance.players[playerIndex];
          // プレイヤーリストから削除（非アクティブ化）
          roomInfo.gameStateInstance.players.splice(playerIndex, 1);
          server_log(
            "room",
            `[${roomId}] プレイヤー ${disconnectingPlayer.name} (${disconnectingPlayer.id}) をリストから削除しました。`,
          );
          break;
        }
      }

      if (disconnectedRoomId) {
        // プレイヤーリストの更新をブロードキャスト
        emitPlayerUpdate(disconnectedRoomId);

        // 2. ルームに残っている接続中のソケットの数をチェック
        // Socket.IO v3/v4では io.in(roomId).fetchSockets() でルーム内のソケットを取得できます。
        const socketsInRoom = await io.in(disconnectedRoomId).fetchSockets();

        server_log(
          "room",
          `[${disconnectedRoomId}] 残りソケット数: ${socketsInRoom.length}`,
        );

        // 3. 残りソケット数が0であればルームをクリーンアップ
        if (socketsInRoom.length === 0) {
          activeRooms.delete(disconnectedRoomId);
          server_log(
            "room",
            `[${disconnectedRoomId}] 誰もいなくなったため、ルームをアクティブリストから削除しました。`,
          );
          // ロビーリストの更新を通知
          io.emit("lobby:room-update");
        } else {
          // ターンプレイヤーが切断した場合、次のターンへ
          const roomInfo = activeRooms.get(disconnectedRoomId);
          if (
            roomInfo &&
            disconnectingPlayer &&
            roomInfo.gameStateInstance.players.length > 0
          ) {
            // 切断されたプレイヤーが現在のターンプレイヤーだった場合、ターンをスキップ（次のプレイヤーに移動）
            const currentTurnPlayer =
              roomInfo.gameStateInstance.players[roomInfo.currentTurnIndex];
            if (
              currentTurnPlayer &&
              currentTurnPlayer.id === disconnectingPlayer.id
            ) {
              roomInfo.currentTurnIndex =
                roomInfo.currentTurnIndex %
                roomInfo.gameStateInstance.players.length; // 新しいプレイヤー数に基づいてインデックスを調整
              server_log(
                "game",
                `[${disconnectedRoomId}] ターンプレイヤーが切断したため、次のターンへ移行します: ${
                  roomInfo.gameStateInstance.players[roomInfo.currentTurnIndex]
                    ?.name
                }`,
              );
              io.to(disconnectedRoomId).emit("game:turn", {
                playerId:
                  roomInfo.gameStateInstance.players[roomInfo.currentTurnIndex]
                    ?.id,
                currentRound: roomInfo.currentRoundIndex,
                currentTurnIndex: roomInfo.currentTurnIndex,
              });
            }
          }
        }
      }
    });
  });
}
