// -----------------------------------------------------------------
// ログ、型定義、ヘルパー関数の再定義
// -----------------------------------------------------------------

// ログ出力カテゴリ設定（true=出力, false=非表示）
let LOG_CATEGORIES = {
  connection: true,
  deck: false,
  card: true,
  cell: true,
  game: true,
  dice: true,
  timer: false,
  addScore: true,
  resource: true,
  disconnect: true,
  warn: true,
};

const ANSI_RED = '\x1b[31m';
const ANSI_RESET = '\x1b[0m';

function server_log(tag, ...args) {
  if (!LOG_CATEGORIES[tag]) return;
  
  if (tag === 'warn') {
    console.warn(ANSI_RED + `[${tag}]` + ANSI_RESET, ...args.map(arg => ANSI_RED + String(arg) + ANSI_RESET));
  } else {
    console.log(`[${tag}]`, ...args);
  }
}

// 座標の型定義
/**
 * @typedef {object} Location
 * @property {number} row
 * @property {number} col
 */

// プレイヤーの型定義（サーバー側）
/**
 * @typedef {object} ServerPlayer
 * @property {string} id
 * @property {string} name
 * @property {any[]} cards
 * @property {number} score
 * @property {any[]} resources
 * @property {Location} position
 */

// ゲーム状態の型定義
/**
 * @typedef {object} GameState
 * @property {ServerPlayer[]} players
 * @property {any[]} initialResources
 * @property {any[][]} board
 * @property {Location[]} exploredCells 
 * @property {number} turn
 */

// -----------------------------------------------------------------
// 探索済みマス目のユーティリティ関数
// -----------------------------------------------------------------

/**
 * マスが探索済みリストに含まれているかチェックする
 * @param {Location[]} exploredCells
 * @param {Location} location
 * @returns {boolean}
 */
const isExplored = (exploredCells, location) => {
    return exploredCells.some(loc => loc.row === location.row && loc.col === location.col);
};

/**
 * マスを探索済みとしてマークする
 * @param {GameState} gameState
 * @param {Location} location
 */
const markCellAsExplored = (gameState, location) => {
    if (!isExplored(gameState.exploredCells, location)) {
        gameState.exploredCells.push(location);
        return true; // 更新された
    }
    return false; // 更新なし
};

/**
 * 特定のマスを探索済みリストから削除する（未探索に戻す）
 * @param {GameState} gameState
 * @param {Location} location
 * @returns {boolean} - 削除されたかどうか
 */
const unmarkCellAsExplored = (gameState, location) => {
    const initialLength = gameState.exploredCells.length;
    
    // マッチしない要素のみを残す（フィルタリングで削除を実現）
    gameState.exploredCells = gameState.exploredCells.filter(loc => 
        !(loc.row === location.row && loc.col === location.col)
    );

    const wasRemoved = gameState.exploredCells.length < initialLength;

    if (wasRemoved) {
        server_log('cell', `マス (${location.row}, ${location.col}) の探索済みマークを解除しました。`);
    }
    
    return wasRemoved;
};

// Fisher-Yates シャッフル
const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
};

// 初期ボードデータ（配列の配列）からランダムな確定盤面を作成
const createRandomBoard = (initialBoard) => {
    if (!initialBoard || initialBoard.length === 0 || initialBoard[0].length === 0) {
        server_log("warn", "createRandomBoard: initialBoardが空です。");
        return [];
    }
    
    const rows = initialBoard.length;
    const cols = initialBoard[0].length; 
    
    // 全てのセルを一次元配列に展開
    let allCells = [];
    initialBoard.forEach(rowArr => {
        allCells = allCells.concat(rowArr);
    });

    // セルをランダムにシャッフル
    shuffleArray(allCells);

    const newBoard = [];
    let cellIndex = 0;

    // シャッフルされたセルを新しい二次元配列（盤面）に再構築
    for (let r = 0; r < rows; r++) {
        const newRow = [];
        for (let c = 0; c < cols; c++) {
            if (cellIndex >= allCells.length) break; 
            
            const originalCell = allCells[cellIndex];
            
            newRow.push({ 
                ...originalCell, 
              id: `r${r}c${c}`
            });
            cellIndex++;
        }
        if (newRow.length > 0) {
            newBoard.push(newRow);
        }
    }
    
    return newBoard;
};

// -----------------------------------------------------------------
// タイル効果の適用ロジック (NEW!)
// -----------------------------------------------------------------

/**
 * プレイヤーが停止したマス目の効果を適用する
 * @param {GameState} gameState - 現在のゲーム状態
 * @param {string} playerId - 効果を適用するプレイヤーのID
 * @param {Location} location - プレイヤーが停止したマス目の座標
 * @param {function} updateResource - リソース更新ヘルパー関数
 */
const applyCellEffect = (gameState, playerId, location, cellEffects, addScore, updatePlayerResource) => {
    const { row, col } = location;
    
    // 座標が盤面の範囲内かチェック
    if (row < 0 || row >= gameState.board.length || col < 0 || col >= gameState.board[row].length) {
        server_log("warn", `applyCellEffect: 不正な座標 (${row}, ${col}) が指定されました。`);
        return;
    }

    // 効果発動
    const cell = gameState.board[row][col];
    const effect = cellEffects[cell.name];
    
    if (effect) {
        server_log("cell", `マス効果発動: ${cell.name} by ${playerId}`);
        
        try {
          effect({ 
            playerId, 
            addScore, 
            updateResource: updatePlayerResource 
          }); 
        } catch (e) {
            server_log("warn", `マス効果の実行中にエラーが発生しました: ${cell.name}`, e);
        }
    } else {
        server_log("cell", `マス効果なし: (${row}, ${col}) ${cell.effect}`);
    }
};


// ------------------------------------
// メインのゲームロジック初期化関数
// ------------------------------------

export function initGameServer(io, options = {}) {
  // === ログ設定の初期化 ===
  if (options.initialLogCategories) {
    LOG_CATEGORIES = { 
        ...LOG_CATEGORIES, 
        ...options.initialLogCategories 
    };
    console.log("[log] ログカテゴリをオプションで初期化しました。", LOG_CATEGORIES);
  }
  // =============================
    
  const initialDecks = options.initialDecks || [];
  const cardEffects = options.cardEffects || {};
  const initialResources = options.initialResources || []; 
  const initialBoard = options.initialBoard || []; 
  const cellEffects = options.cellEffects || [];

  // 盤面の初期化
  const Cells = createRandomBoard(initialBoard);
  const isBoardInitialized = Cells.length > 0;
  
  /** @type {GameState} */
  const gameState = {
      players: [], 
      initialResources: initialResources,
      board: Cells, 
      exploredCells: [], 
      turn: 1, 
  };
  
  // ------------------------------------
  // デッキ関連の状態と初期化
  // ------------------------------------
  const decks = {};
  const drawnCards = {};
  const playFieldCards = {};
  const discardPile = {}; 
  let currentTurnIndex = 0;

  if (isBoardInitialized) {
    server_log("game", `確定盤面 (Cells) を ${Cells.length}x${Cells[0]?.length} サイズで初期化しました。`);
    io.emit('game:init-board', gameState.board);
    server_log("game", 'Initial board broadcasted to all clients.');
  } else {
    server_log("warn", "initialBoardが提供されていないため、盤面は空のままです。");
  }
  
  // 初期デッキを登録
  initialDecks.forEach(({ deckId, name, cards, backColor }) => {
    decks[deckId] = cards.map(c => ({
      ...c,
      deckId,
      backColor: backColor,
      onPlay: cardEffects[c.name] || (() => {}),
      location: "deck",
    }));
    drawnCards[deckId] = [];
    playFieldCards[deckId] = [];
    discardPile[deckId] = []; 
    server_log("deck", `デッキ "${name}" (${deckId}) 初期化完了`);
  });


  // 共通関数：Deck 状態をクライアントに送信
  function emitDeckUpdate(deckId) {
    io.emit(`deck:update:${deckId}`, {
      currentDeck: decks[deckId].filter(c => c.location === "deck"), 
      drawnCards: drawnCards[deckId],
      playFieldCards: playFieldCards[deckId],
      discardPile: discardPile[deckId],
    });
    io.emit("players:update", gameState.players);
  }

  // 共通関数：Player 状態をクライアントに送信
  function emitPlayerUpdate() {
      io.emit("players:update", gameState.players);
  }
  
  // 探索済みマス目リストを全クライアントにブロードキャストするヘルパー関数
  const broadcastExploredUpdate = () => {
      // ⭐ クライアント側の要求に合わせてイベント名を 'board-update' に変更
      io.emit('board-update', gameState.exploredCells); 
      server_log('cell', `Explored cells updated and broadcasted. Total: ${gameState.exploredCells.length}`);
  };

  // スコア加算関数
  function addScore(playerId, points) {
    const player = gameState.players.find(p => p.id === playerId);
    if (!player) return;
    player.score = (player.score || 0) + points;
    server_log("addScore", `${player.name} に ${points} ポイント加算`);
    emitPlayerUpdate();
  }
  
  // 統一された汎用リソース更新関数
  function updatePlayerResource(playerId, resourceId, amount) {
    const player = gameState.players.find(p => p.id === playerId);
    if (!player || !player.resources) return false;

    const resource = player.resources.find(r => r.id === resourceId);
    if (!resource) {
      server_log("warn", `リソースID "${resourceId}" が見つかりません。カード効果が適用できませんでした。`);
      return false;
    }

    const newValue = resource.currentValue + amount;
    resource.currentValue = Math.min(resource.maxValue, Math.max(0, newValue));

    server_log(
        "resource", 
        `${player.name}: ${resource.name} を ${amount > 0 ? '+' : ''}${amount}、現在値: ${resource.currentValue}`
    );
    
    emitPlayerUpdate();
    return true;
  }

  // デッキをシャッフル
  function shuffleDeck(deckId) {
    if (!decks[deckId]) return;
    
    const currentDeck = decks[deckId].filter(c => c.location === "deck");
    const otherCards = decks[deckId].filter(c => c.location !== "deck"); 
    
    for (let i = currentDeck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [currentDeck[i], currentDeck[j]] = [currentDeck[j], currentDeck[i]];
    }
    
    decks[deckId] = currentDeck.concat(otherCards); 
    server_log("deck", `デッキ ${deckId} をシャッフルしました`);
  }

  // --------------------
  // Socket.IO 接続
  // --------------------
  io.on("connection", socket => {
    server_log("connection", `クライアント接続: ${socket.id}`);

    // 接続時に確定盤面データをクライアントに送信
    if (isBoardInitialized) {
        socket.emit("game:init-board", gameState.board);
        server_log("game", `接続時にクライアント ${socket.id} へ盤面データを送信`);
    }
    
    // 1. 新規プレイヤーに初期リソースと初期位置オブジェクトを追加
    const newPlayer = { 
        id: socket.id, 
        name: `Player ${gameState.players.length + 1}`,
        cards: [], 
        score: 0,
        resources: JSON.parse(JSON.stringify(initialResources)),
        position: { row: 0, col: 0 } 
    };
    
    gameState.players.push(newPlayer);
    server_log("connection", `新規プレイヤー追加:`, newPlayer);
    socket.emit("player:assign-id", newPlayer.id);
    emitPlayerUpdate(); // 全プレイヤーへ更新を通知
    io.emit("game:turn", gameState.players[currentTurnIndex]?.id);

    // ------------------------------------
    // 2. プレイヤーの移動処理
    // ------------------------------------
    socket.on('game:move-player', ({ playerId, newPosition }) => {
        const playerToMove = gameState.players.find(p => p.id === playerId);

        if (playerToMove) {
            // 1. 位置の更新
            playerToMove.position = newPosition;
            server_log('game', `Player ${playerToMove.name} moved to (${newPosition.row}, ${newPosition.col})`);
            
            // 2. 状態更新: マスを探索済みとしてマーク
            const wasUpdated = markCellAsExplored(gameState, newPosition);

            // 3. マス目の効果を実行 (NEW!)
            applyCellEffect(gameState, playerId, newPosition, cellEffects, addScore, updatePlayerResource);

            // 4. 全クライアントにプレイヤーとボード（探索済みマス）の更新を通知
            emitPlayerUpdate(); 
            
            if (wasUpdated) {
                broadcastExploredUpdate(); // 'board-update' イベントを送信
            }

        } else {
            server_log('warn', `Move requested for unknown player ID: ${playerId}`);
        }
    });

    // ------------------------------------
    // 3. マス目探索処理 (新規追加)
    //    クリックによる移動を分離し、探索/効果発動のみを行う
    // ------------------------------------
    socket.on('game:explore-cell', ({ playerId, targetPosition }) => { 
        const player = gameState.players.find(p => p.id === playerId);
        const { row, col } = targetPosition;

        if (player) {
            server_log('game', `Player ${player.name} exploring cell at (${row}, ${col})`);
            
            // 1. 状態更新: マスを探索済みとしてマーク (プレイヤーの位置は変更しない)
            const wasUpdated = markCellAsExplored(gameState, targetPosition);

            // 2. 全クライアントにプレイヤーとボード（探索済みマス）の更新を通知
            //    (マス効果でリソースなどが変わる可能性があるため、プレイヤー情報も更新)
            emitPlayerUpdate(); 
            
            if (wasUpdated) {
                broadcastExploredUpdate(); // 'board-update' イベントを送信
            }

        } else {
            server_log('warn', `Explore requested for unknown player ID: ${playerId}`);
        }
    });

    socket.on('game:unexplore-cell', ({ targetPosition }) => { 
        // 1. マスを未探索に戻す
        const wasRemoved = unmarkCellAsExplored(gameState, targetPosition);

        // 2. プレイヤー情報（リソースなど）が影響を受けている可能性があるため更新
        emitPlayerUpdate(); 
        
        // 3. 探索済みリストが変更された場合のみ、クライアントにブロードキャスト
        if (wasRemoved) {
            broadcastExploredUpdate(); // ⭐ ここで broadcastExploredUpdate を呼び出す
        } else {
        }
    });

    // ------------------------------------
    
    // 4. 新規接続したクライアントに現在の探索済みマス目リストを送信 (番号を修正)
    if (gameState.exploredCells.length > 0) {
        // ⭐ イベント名を 'board-update' に変更
        socket.emit('board-update', gameState.exploredCells);
    }

    // ログ設定の変更を受け付ける
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

      const cardToDrawId = currentDeck[0].id; 
      
      const cardIndex = decks[deckId].findIndex(c => c.id === cardToDrawId);
      if (cardIndex === -1) return;

      const card = decks[deckId][cardIndex]; 

      if (playerId) {
        const player = gameState.players.find(p => p.id === playerId);
        if (player) {
          player.cards = player.cards || [];
          card.location = drawLocation;
          card.isFaceUp = true;
          
          // ⭐ [修正点] ownerId を設定
          // カードがプレイヤーの手札に入るため、所有者IDを記録します。
          card.ownerId = playerId; 
          
          player.cards.push(card);
        }
      } else {
        // playerId がない場合 (例: 公開の場に引く) は ownerId を設定しない (または undefined/null に設定)
        card.ownerId = undefined; // 明示的に undefined に設定しても良い
        
        card.location = drawLocation || "field";
        drawnCards[deckId].push(card);
      }

      server_log("deck", `デッキ ${deckId} からカードを引きました:`, card);

      emitDeckUpdate(deckId);
      emitPlayerUpdate();
    });

    // デッキシャッフル
    socket.on("deck:shuffle", ({ deckId }) => {
      shuffleDeck(deckId);
      server_log("deck", `デッキ ${deckId} シャッフル`);
      emitDeckUpdate(deckId);
    });

    // デッキリセット 
    socket.on("deck:reset", ({ deckId }) => {
      if (!decks[deckId]) return;

      decks[deckId].forEach(c => {
          // c.location が "discard" または "field" の場合のみ "deck" に戻す
          if (c.location === "discard" || c.location === "field") {
              c.location = "deck";
              c.isFaceUp = false;
          }
      });

      // プレイフィールドと捨て札の配列のみをクリア
      playFieldCards[deckId] = [];
      discardPile[deckId] = [];

      // drawnCardsはクリアしない (手札として保持される可能性のため)

      shuffleDeck(deckId);
      server_log("deck", `デッキ ${deckId} リセット (field/discard のカードのみデッキに戻しシャッフル)`);
      emitDeckUpdate(deckId);
    });
    
    // カード使用
    socket.on("card:play", ({ deckId, cardIds, playerId, playLocation = "field" }) => {
      if (!decks[deckId]) return;

      server_log("card", `受信した playLocation: ${playLocation}`);

      const ids = Array.isArray(cardIds) ? cardIds : [cardIds];

      ids.forEach((cardId) => {
        const card = decks[deckId].find(c => c.id === cardId);
        if (!card) return;

        // 元の配列からの削除（移動元からの削除）
        if (playerId) {
          const player = gameState.players.find(p => p.id === playerId);
          if (player && player.cards) {
            player.cards = player.cards.filter(c => c.id !== cardId);
          }
        }
        
        const drawnIndex = drawnCards[deckId].findIndex(c => c.id === cardId);
        if (drawnIndex !== -1) { drawnCards[deckId].splice(drawnIndex, 1); }
        
        const fieldIndex = playFieldCards[deckId].findIndex(c => c.id === cardId);
        if (fieldIndex !== -1) { playFieldCards[deckId].splice(fieldIndex, 1); }

        const discardIndex = discardPile[deckId].findIndex(c => c.id === cardId);
        if (discardIndex !== -1) { discardPile[deckId].splice(discardIndex, 1); }

        // 新しい場所の配列への追加（移動先への追加）
        card.location = playLocation;
        card.isFaceUp = true;
        
        server_log("card", `プレイヤー ${playerId} がカード ${card.name} を使用`);
        
        // ⭐ [修正点 1] ownerId の処理: 
        if (playLocation === "field") {
            // Field に行く場合: ownerId を維持または設定 (手札から来た場合は既に設定済み)
            // ※ ただし、手札から来たなら ownerId は既に card にあるはずなので、ここでは変更しません。
            //    もしフィールドに置いた時点で playerId を明示的に設定したいなら:
            //    card.ownerId = playerId;
        } else if (playLocation === "discard") {
            // Discard に行く場合: ownerId をクリアする
            card.ownerId = null;
        }
        
        // 効果発動
        const effect = cardEffects[card.name];
        if (effect) {
          server_log("card", `カード効果発揮: ${card.name} by ${playerId}`);
          effect({ 
              playerId, 
              addScore, 
              updateResource: updatePlayerResource 
          }); 
        } else {
          server_log("card", `カード効果なし: ${card.name} by ${playerId}`);
        }
        
        server_log("card", `[${playLocation}] へ移動しました`);

        // 配列を playLocation に応じて振り分け (新しい場所に追加)
        if (playLocation === "field") {
          playFieldCards[deckId].push(card);
        } else if (playLocation === "discard") {
          discardPile[deckId].push(card);
        }
      });

      emitDeckUpdate(deckId); 
      emitPlayerUpdate(); 
    });

    // ⭐ [新規追加] カードを手札に戻す
    socket.on("card:return-to-hand", ({ deckId, cardId, targetPlayerId }) => {
        if (!decks[deckId] || !targetPlayerId) {
            server_log("warn", "card:return-to-hand: 不正なデッキIDまたはターゲットプレイヤーIDです。", { deckId, targetPlayerId });
            return;
        }

        const card = decks[deckId].find(c => c.id === cardId);
        const player = gameState.players.find(p => p.id === targetPlayerId);

        if (!card || !player) {
            server_log("warn", "card:return-to-hand: カードまたはプレイヤーが見つかりません。", { cardId, targetPlayerId });
            return;
        }

        // 1. 移動元 (PlayField) からの削除
        const fieldIndex = playFieldCards[deckId].findIndex(c => c.id === cardId);
        if (fieldIndex !== -1) {
            playFieldCards[deckId].splice(fieldIndex, 1);
        } else {
            server_log("warn", `card:return-to-hand: カード ${card.name} はPlayFieldに見つかりませんでしたが、処理を続行します。`);
        }

        // 2. カードの属性を更新
        card.location = "hand"; // ロケーションを手札に戻す
        card.isFaceUp = true;    // (手札に戻るため通常は表向きを維持)
        // card.ownerId は既に設定されているはずなので、ここでは変更しない

        // 3. 移動先 (プレイヤーの手札) への追加
        player.cards.push(card);
        
        server_log("card", `カード ${card.name} を持ち主 ${player.name} の手札に戻しました。`);

        // 4. 全クライアントへ更新を通知
        emitDeckUpdate(deckId); 
        emitPlayerUpdate(); 
    });

    // ダイスロール 
    socket.on("dice:roll", ({ diceId, sides }) => {
      const value = Math.floor(Math.random() * sides) + 1;
      server_log("dice", `サイコロ ${diceId} の出目: ${value}`);
      io.emit(`dice:rolled:${diceId}`, value);
    });

    // タイマー開始
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

    // ------------------------------------
    // 5. スコア加算処理
    // ------------------------------------
    socket.on('player:add-score', ({ targetPlayerId, points }) => {
        // ターゲットIDがない場合は、要求したクライアント自身に加算
        const playerId = targetPlayerId || socket.id; 
        addScore(playerId, points);
        server_log('addScore', `外部要求により ${playerId} に ${points} ポイント加算`);
    });

    // ------------------------------------
    // 6. 汎用リソース更新処理
    // ------------------------------------
    socket.on("player:update-resource", ({ targetPlayerId, resourceId, amount }) => {
        // ターゲットIDがない場合は、要求したクライアント自身のリソースを更新
        const playerId = targetPlayerId || socket.id; 
        
        // 既存の updatePlayerResource 関数を呼び出す
        const success = updatePlayerResource(playerId, resourceId, amount);

        if (success) {
            server_log('resource', `外部要求により ${playerId} の ${resourceId} を ${amount} 更新`);
        } else {
            server_log('warn', `外部要求によるリソース更新失敗: ${playerId}, ${resourceId}`);
        }
    });

    // 次のターン
    socket.on("game:next-turn", () => {
      currentTurnIndex = (currentTurnIndex + 1) % gameState.players.length;
      server_log("game", `次のターン: ${gameState.players[currentTurnIndex]?.name}`);
      io.emit("game:turn", gameState.players[currentTurnIndex]?.id);
    });

    // 切断
    socket.on("disconnect", () => {
      server_log("disconnect", `プレイヤー切断: ${socket.id}`);
      gameState.players = gameState.players.filter((p) => p.id !== socket.id);

      if (currentTurnIndex >= gameState.players.length) currentTurnIndex = 0;
      if (gameState.players.length > 0) {
        server_log("disconnect", `現在のターン: ${gameState.players[currentTurnIndex]?.name}`);
        io.emit("game:turn", gameState.players[currentTurnIndex]?.id);
      } else {
        server_log("disconnect", "プレイヤーがいなくなりました。");
        io.emit("game:turn", null);
      }
      
      emitPlayerUpdate();
    });
  });
}
