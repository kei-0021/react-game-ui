import {
    applyCellEffect,
    createRandomBoard,
    LOG_CATEGORIES,
    markCellAsExplored,
    MockGameState,
    server_log,
    unmarkCellAsExplored,
} from './server-utils.js';

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
        // ★ 修正点: activeRooms に保存されている roomInfo.name を使用
        name: roomInfo.name, 
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
function initializeRoom(roomId, options) {
    const initialDecks = options.initialDecks || [];
    const initialResources = options.initialResources || []; 
    const initialTokenStores = options.initialTokenStore || []; 
    const initialTokens = options.initialTokens || [];
    const initialBoard = options.initialBoard || []; 

    const Cells = createRandomBoard(initialBoard);
    
    /** @type {GameState} */
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

    initialDecks.forEach(({ deckId, name, cards, backColor }) => {
        decks[deckId] = cards.map(c => ({
            ...c,
            deckId,
            backColor: backColor,
            onPlay: options.cardEffects[c.name] || (() => {}),
            location: "deck",
        }));
        drawnCards[deckId] = [];
        playFieldCards[deckId] = [];
        discardPile[deckId] = []; 
        server_log("deck", `[${roomId}] デッキ "${name}" (${deckId}) 初期化完了`);
    });

    const roomInfo = {
        roomId,
        createdAt: Date.now(),
        currentTurnIndex: 0,
        decks,
        drawnCards,
        playFieldCards,
        discardPile,
        gameStateInstance,
    };
    
    activeRooms.set(roomId, roomInfo);
    server_log("room", `ルーム ${roomId} を初期化し、アクティブリストに追加しました。`);

    return roomInfo;
}


export function initGameServer(io, options = {}) {
    // === ログ設定の初期化 ===
    if (options.initialLogCategories) {
        // server-utils.js の LOG_CATEGORIES を更新
        Object.assign(LOG_CATEGORIES, options.initialLogCategories);
        console.log("[log] ログカテゴリをオプションで初期化しました。", LOG_CATEGORIES);
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
            currentDeck: roomInfo.decks[deckId].filter(c => c.location === "deck"), 
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

        io.to(roomId).emit('board-update', roomInfo.gameStateInstance.exploredCells); 
        server_log('cell', `[${roomId}] Explored cells updated and broadcasted. Total: ${roomInfo.gameStateInstance.exploredCells.length}`);
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

        const player = roomInfo.gameStateInstance.players.find(p => p.id === playerId);
        if (!player) return;
        player.score = (player.score || 0) + points;
        server_log("addScore", `[${roomId}] ${player.name} に ${points} ポイント加算`);
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

        const player = roomInfo.gameStateInstance.players.find(p => p.id === playerId);
        if (!player || !player.resources) return false;

        const resource = player.resources.find(r => r.id === resourceId);
        if (!resource) {
            server_log("warn", `[${roomId}] リソースID "${resourceId}" が見つかりません。`);
            return false;
        }

        const newValue = resource.currentValue + amount;
        resource.currentValue = Math.min(resource.maxValue, Math.max(0, newValue));

        server_log(
            "resource", 
            `[${roomId}] ${player.name}: ${resource.name} を ${amount > 0 ? '+' : ''}${amount}、現在値: ${resource.currentValue}`
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

        const player = roomInfo.gameStateInstance.players.find(p => p.id === playerId);
        if (!player || !player.tokens) return false;

        const token = player.tokens.find(t => t.id === tokenId);
        if (!token) {
            server_log("warn", `[${roomId}] トークンID "${tokenId}" がプレイヤーのインベントリに見つかりません。`);
            return false;
        }

        const newValue = (token.count || 0) + amount;
        token.count = Math.max(0, newValue);

        server_log(
            "token", 
            `[${roomId}] ${player.name}: ${token.name || tokenId} を ${amount > 0 ? '+' : ''}${amount}、現在枚数: ${token.count}`
        );
        
        emitPlayerUpdate(roomId);
        return true;
    }

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
            timestamp: Date.now()
        };
        server_log("popup", `[${roomId}] 全員にポップアップ要求: ${message} (色: ${color})`);
        io.to(roomId).emit("client:show-popup", popupContent);
    }

    // デッキをシャッフル
    function shuffleDeck(roomId, deckId) {
        const roomInfo = activeRooms.get(roomId);
        if (!roomInfo || !roomInfo.decks[deckId]) return;

        const decks = roomInfo.decks;
        
        const currentDeck = decks[deckId].filter(c => c.location === "deck");
        const otherCards = decks[deckId].filter(c => c.location !== "deck"); 
        
        // Fisher-Yates シャッフル
        for (let i = currentDeck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [currentDeck[i], currentDeck[j]] = [currentDeck[j], currentDeck[i]];
        }
        
        // シャッフルしたデッキと、手札/フィールド/捨て札を結合
        const shuffledDeck = currentDeck.concat(otherCards);
        // 全体のカードリストを更新（locationのプロパティは維持）
        roomInfo.decks[deckId] = shuffledDeck;

        server_log("deck", `[${roomId}] デッキ ${deckId} をシャッフルしました`);
    }

    // --------------------
    // Socket.IO 接続
    // --------------------
    io.on("connection", socket => {
        // 1. ロビー機能: アクティブルームリストの取得
        socket.on('lobby:get-rooms', () => {
            server_log('lobby', `クライアント ${socket.id} からルームリスト要求を受信。`);
            
            const roomList = Array.from(activeRooms.keys())
                .map(getRoomMeta)
                .filter(meta => meta !== null);

            socket.emit('lobby:rooms-list', roomList);
        });

        // 2. ルーム参加処理 
        socket.on("room:join", async ({ roomId, playerName, roomName }) => {
            // 💡 修正点: 不正なroomId、またはロビー接続時に誤って送信されたroomIdを厳しくチェック
            if (!roomId || typeof roomId !== 'string') {
                 server_log("warn", `Client ${socket.id} が不正な roomId: ${roomId} で join を試行しました。初期化をスキップします。`);
                 return; 
            }

            // ★ 修正2: プレイヤー名が提供されているかチェック
            const providedName = (typeof playerName === 'string' && playerName.trim().length > 0) ? playerName.trim() : null;

            server_log("room", `[${roomId}] Client ${socket.id} が join リクエストを送信 (Name: ${providedName || 'N/A'})`);

            let roomInfo = activeRooms.get(roomId);

            if (!roomInfo) {
                // ★ 新規ルーム作成
                roomInfo = initializeRoom(roomId, options);
                
                // ★ 修正2: ルーム情報を直接更新して name を設定
                // クライアントから提供された name を使用し、なければデフォルト名を適用
                roomInfo.name = (typeof roomName === 'string' && roomName.trim().length > 0) ? roomName.trim() : `Room ${roomId.substring(0, 4)}`;
                
                activeRooms.set(roomId, roomInfo); // name 設定後に Map を更新（安全策）
                
                // 新規ルーム作成時にロビーリストの更新を通知
                io.emit('lobby:room-update'); 
            }
            
            await socket.join(roomId);
            server_log('room', `クライアント ${socket.id} がルーム ${roomId} に参加しました。`);
            
            const { gameStateInstance, decks, currentTurnIndex } = roomInfo;
            
            const existingPlayer = gameStateInstance.players.find(p => p.socketId === socket.id);
            
            if (!existingPlayer) {
                const initialTokensCopy = Array.isArray(options.initialTokens) 
                    ? JSON.parse(JSON.stringify(options.initialTokens))
                    : [];
                
                // ★ 修正3: playerIdの定義をnewPlayerオブジェクト定義の前に移動
                const playerId = `${roomId}_p${gameStateInstance.players.length + 1}`; 
                
                const newPlayer = { 
                    id: playerId, // 定義済みの playerId を使用
                    // ★ providedNameが提供されていればそれを使用し、なければ自動生成名を使う
                    name: providedName || `Player ${gameStateInstance.players.length + 1}`,
                    socketId: socket.id, 
                    cards: [], 
                    score: 0,
                    resources: JSON.parse(JSON.stringify(options.initialResources)),
                    tokens: initialTokensCopy, 
                    position: { row: 0, col: 0 } 
                };
                
                gameStateInstance.players.push(newPlayer);
                server_log("room", `[${roomId}] 新規プレイヤー追加: ${newPlayer.name} (${newPlayer.id})`);
                socket.emit("player:assign-id", newPlayer.id);

                const { deckId: startDeckId, count: startCount } = initialHand;

                if (startDeckId && startCount > 0 && decks[startDeckId]) {
                    
                    const deckTotalCards = decks[startDeckId]; // 全てのカードリスト
                    let cardsDealt = 0; // 実際に配った枚数をカウントする

                    for (let i = 0; i < startCount; i++) {
                        // デッキの先頭（locationが"deck"）にあるカードを検索
                        const cardIndex = deckTotalCards.findIndex(c => c.location === "deck");
                        
                        if (cardIndex === -1) {
                            server_log("warn", `[${roomId}] 初期手札配布中にデッキ ${startDeckId} のカードが不足しました。`);
                            break; 
                        }

                        const card = deckTotalCards[cardIndex]; 
                        card.location = "hand";
                        card.isFaceUp = true;
                        card.ownerId = newPlayer.id; 
                        newPlayer.cards.push(card);
                        cardsDealt++;
                    }
                    
                    if (cardsDealt < startCount) {
                         server_log("warn", `[${roomId}] 初期手札配布中にデッキ ${startDeckId} のカードが不足しました。実際に配布された枚数: ${cardsDealt}/${startCount}`);
                    } else {
                         server_log("deck", `[${roomId}] 初期手札 ${startDeckId} から ${cardsDealt} 枚を ${newPlayer.name} に配布しました。`);
                    }
                }
            } else {
                existingPlayer.socketId = socket.id;
                server_log('room', `[${roomId}] プレイヤー ${existingPlayer.name} (${existingPlayer.id}) がソケット ${socket.id} で再接続しました。`);
                socket.emit("player:assign-id", existingPlayer.id);
            }
            
            // ルーム内の全クライアントに初期状態を送信
            if (roomInfo.gameStateInstance.board.length > 0) {
                io.to(roomId).emit("game:init-board", roomInfo.gameStateInstance.board);
            }
            gameStateInstance.tokenStores.forEach(store => {
                io.to(roomId).emit(`token-store:init:${roomId}:${store.id}`, store.getTokens());
            });
            Object.keys(decks).forEach((deckId) => {
                io.to(roomId).emit(`deck:init:${deckId}`, {
                    currentDeck: decks[deckId].filter(c => c.location === "deck"),
                    drawnCards: roomInfo.drawnCards[deckId],
                });
                emitDeckUpdate(roomId, deckId); 
            });

            emitPlayerUpdate(roomId); 
            io.to(roomId).emit("game:turn", gameStateInstance.players[currentTurnIndex]?.id);
            if (gameStateInstance.exploredCells.length > 0) {
                io.to(roomId).emit('board-update', gameStateInstance.exploredCells);
            }
        });

        // スコア加算
        socket.on("room:player:add-score", ({ roomId, targetPlayerId, points }) => {
            const roomInfo = activeRooms.get(roomId);
            if (!roomInfo) return;

            addScore(roomId, targetPlayerId, points);
        });

        socket.on("room:player:update-resource", ({ roomId, playerId, resourceId, amount }) => {
            const roomInfo = activeRooms.get(roomId);
            if (!roomInfo) return;

            updatePlayerResource(roomId, playerId, resourceId, amount);
        });

        // 2.5. カスタムイベントの登録
        const events = options.customEvents ? options.customEvents() : {};
        for (const [event, handler] of Object.entries(events)) {
            socket.on(event, (data) => {
                console.log(`[CustomEvent] ${event} received from ${socket.id}`, data);
                try {
                    handler(socket, data);
                } catch (err) {
                    console.error(`[CustomEvent] ${event} handler error:`, err);
                }
            });
        }

        // 3. プレイヤーの移動処理
        socket.on('game:move-player', ({ roomId, playerId, newPosition }) => {
            const roomInfo = activeRooms.get(roomId);
            if (!roomInfo) { server_log('warn', `[${roomId}] ルームが見つかりません for move-player`); return; }

            const { gameStateInstance } = roomInfo;
            const playerToMove = gameStateInstance.players.find(p => p.id === playerId);

            if (playerToMove) {
                playerToMove.position = newPosition;
                server_log('game', `[${roomId}] Player ${playerToMove.name} moved to (${newPosition.row}, ${newPosition.col})`);
                
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
                    (msg, color) => requirePopup(roomId, msg, color)
                );

                emitPlayerUpdate(roomId); 
                
                if (wasUpdated) {
                    broadcastExploredUpdate(roomId); 
                }

            } else {
                server_log('warn', `[${roomId}] Move requested for unknown player ID: ${playerId}`);
            }
        });

        // 4. マス目探索処理 (roomIdを要求)
        socket.on('game:explore-cell', ({ roomId, playerId, targetPosition }) => { 
            const roomInfo = activeRooms.get(roomId);
            if (!roomInfo) { server_log('warn', `[${roomId}] ルームが見つかりません for explore-cell`); return; }

            const { gameStateInstance } = roomInfo;
            const player = gameStateInstance.players.find(p => p.id === playerId);
            const { row, col } = targetPosition;

            if (player) {
                server_log('game', `[${roomId}] Player ${player.name} exploring cell at (${row}, ${col})`);
                
                const wasUpdated = markCellAsExplored(gameStateInstance, targetPosition);
                
                emitPlayerUpdate(roomId); 
                
                if (wasUpdated) {
                    broadcastExploredUpdate(roomId); 
                }

            } else {
                server_log('warn', `[${roomId}] Explore requested for unknown player ID: ${playerId}`);
            }
        });

        socket.on('game:unexplore-cell', ({ roomId, targetPosition }) => { 
            const roomInfo = activeRooms.get(roomId);
            if (!roomInfo) { server_log('warn', `[${roomId}] ルームが見つかりません for unexplore-cell`); return; }
            
            const wasRemoved = unmarkCellAsExplored(roomInfo.gameStateInstance, targetPosition);

            emitPlayerUpdate(roomId); 
            
            if (wasRemoved) {
                broadcastExploredUpdate(roomId); 
            }
        });

        // 💡 修正箇所: 5. ダイスロール要求の処理 (イベント名をクライアント側の期待値に合わせる)
        socket.on('dice:roll', ({ roomId, diceId, sides }) => {
            const roomInfo = activeRooms.get(roomId);
            if (!roomInfo) { 
                server_log('warn', `[${roomId}] ルームが見つかりません for dice-roll`); 
                return; 
            }
            
            // 乱数生成: 1からsidesまでの整数
            const rollValue = Math.floor(Math.random() * sides) + 1;
            
            server_log('game', `[${roomId}] Dice ${diceId} rolled D${sides}. Result: ${rollValue}`);

            // 💡 修正: ルーム内の全員に結果を、ユニークなイベント名でブロードキャスト
            // クライアントの Dice.js が期待するイベント名: `dice:rolled:${roomId}:${diceId}`
            io.to(roomId).emit(`dice:rolled:${roomId}:${diceId}`, rollValue);

            // TODO: ゲームロジック側で、このロール結果をプレイヤーの移動や行動に反映する
        });

        // ログ設定の変更を受け付ける 
        socket.on("log:set-category", ({ category, enabled }) => {
            if (LOG_CATEGORIES.hasOwnProperty(category)) {
                LOG_CATEGORIES[category] = enabled;
                console.log(`[log] カテゴリ "${category}" のログ出力を ${enabled ? '有効' : '無効'} に設定しました。`);
            } else {
                console.warn(`[log] 未知のログカテゴリ "${category}" が指定されました。`);
            }
        });

        // カードを引く 
        socket.on("deck:draw", ({ roomId, deckId, playerId, drawLocation = "hand" }) => {
            const roomInfo = activeRooms.get(roomId);
            if (!roomInfo || !roomInfo.decks[deckId]) { server_log('warn', `[${roomId}] ルームまたはデッキが見つかりません for draw`); return; }

            const { decks } = roomInfo;
            // デッキにあるカードのみをフィルタリング
            const currentDeck = decks[deckId].filter(c => c.location === "deck");
            if (!currentDeck.length) {
                server_log("warn", `[${roomId}] デッキ ${deckId} は空です。`);
                return;
            }

            // デッキの先頭にあるカードのIDを取得
            const cardToDrawId = currentDeck[0].id; 
            // 全カードリストからそのカードのインデックスを取得
            const cardIndex = decks[deckId].findIndex(c => c.id === cardToDrawId);
            
            if (cardIndex === -1) {
                server_log("warn", `[${roomId}] デッキリストからカード ${cardToDrawId} が見つかりません。`);
                return;
            }

            const card = decks[deckId][cardIndex]; 

            if (playerId) {
                const player = roomInfo.gameStateInstance.players.find(p => p.id === playerId);
                if (player) {
                    player.cards = player.cards || [];
                    card.location = drawLocation;
                    card.isFaceUp = true;
                    card.ownerId = playerId; 
                    
                    player.cards.push(card);
                }
            } else {
                card.ownerId = null;
                
                card.location = drawLocation || "field";
                roomInfo.playFieldCards[deckId].push(card);
            }

            server_log("deck", `[${roomId}] デッキ ${deckId} からカードを引きました: ${card.name}`);

            emitDeckUpdate(roomId, deckId);
            emitPlayerUpdate(roomId);
        });

        // デッキシャッフル
        socket.on("deck:shuffle", ({ roomId, deckId }) => {
            if (!activeRooms.has(roomId)) { server_log('warn', `[${roomId}] ルームが見つかりません for shuffle`); return; }
            shuffleDeck(roomId, deckId);
            server_log("deck", `[${roomId}] デッキ ${deckId} シャッフル`);
            emitDeckUpdate(roomId, deckId);
        });

        // デッキリセット（プレイヤーの手札はそのまま）
        socket.on("deck:reset", ({ roomId, deckId }) => {
            const roomInfo = activeRooms.get(roomId);
            if (!roomInfo || !roomInfo.decks[deckId]) { 
                server_log('warn', `[${roomId}] ルームまたはデッキが見つかりません for reset`); 
                return; 
            }

            const { decks, playFieldCards, discardPile } = roomInfo;

            // デッキ・プレイフィールド・捨て札のカード位置をリセット
            decks[deckId].forEach(c => {
                if (c.location === "discard" || c.location === "field") {
                    c.location = "deck";
                    c.isFaceUp = false;
                    c.ownerId = null; // 所有者をクリア
                }
            });

            // 各配列をクリア
            playFieldCards[deckId] = [];
            discardPile[deckId] = [];

            shuffleDeck(roomId, deckId);
            server_log("deck", `[${roomId}] デッキ ${deckId} リセット（手札はそのまま）`);
            emitDeckUpdate(roomId, deckId);
        });

        // カード使用
        socket.on("card:play", ({ roomId, deckId, cardIds, playerId, playLocation = "field" }) => {
            const roomInfo = activeRooms.get(roomId);
            if (!roomInfo || !roomInfo.decks[deckId]) { server_log('warn', `[${roomId}] ルームまたはデッキが見つかりません for card:play`); return; }

            const { decks, playFieldCards, discardPile, gameStateInstance } = roomInfo;
            const ids = Array.isArray(cardIds) ? cardIds : [cardIds];

            ids.forEach((cardId) => {
                const card = decks[deckId].find(c => c.id === cardId);
                if (!card) return;

                // 元の配列からの削除（手札からの削除）
                if (playerId) {
                    const player = gameStateInstance.players.find(p => p.id === playerId);
                    if (player && player.cards) {
                        player.cards = player.cards.filter(c => c.id !== cardId);
                    }
                }
                
                // カードの location を更新
                card.location = playLocation;
                card.isFaceUp = true;
                
                server_log("card", `[${roomId}] プレイヤー ${playerId} がカード ${card.name} を ${playLocation} に移動`);
                
                // プレイフィールド、捨て札リストを更新（サーバー側で状態を追跡するための配列）
                // 既存の場所からの削除と新しい場所への追加を行う
                [playFieldCards[deckId], discardPile[deckId]].forEach(arr => {
                    const index = arr.findIndex(c => c.id === cardId);
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
                    server_log("card", `[${roomId}] カード効果発揮: ${card.name} by ${playerId}`);
                    effect({ 
                        playerId, 
                        addScore: (points) => addScore(roomId, playerId, points), 
                        updateResource: (resourceId, amount) => updatePlayerResource(roomId, playerId, resourceId, amount),
                        updateToken: (tokenId, amount) => updatePlayerToken(roomId, playerId, tokenId, amount)
                    }); 
                }
            });

            emitDeckUpdate(roomId, deckId);
            emitPlayerUpdate(roomId);
        });

        // カードを手札に戻す
        socket.on("card:return-to-hand", ({ roomId, deckId, cardId, targetPlayerId }) => {
            const room = activeRooms.get(roomId); // ← gameRooms ではなく activeRooms を使う
            if (!room) {
                server_log("warn", "card:return-to-hand: 無効なルームIDです。", { roomId });
                return;
            }

            const { decks, playFieldCards, gameStateInstance } = room; // gameStateInstance に修正

            if (!decks[deckId] || !targetPlayerId) {
                server_log("warn", "card:return-to-hand: 不正なデッキIDまたはターゲットプレイヤーIDです。", { deckId, targetPlayerId });
                return;
            }

            const card = decks[deckId].find(c => c.id === cardId);
            const player = gameStateInstance.players.find(p => p.id === targetPlayerId);

            if (!card || !player) {
                server_log("warn", "card:return-to-hand: カードまたはプレイヤーが見つかりません。", { cardId, targetPlayerId });
                return;
            }

            const fieldIndex = playFieldCards[deckId].findIndex(c => c.id === cardId);
            if (fieldIndex !== -1) {
                playFieldCards[deckId].splice(fieldIndex, 1);
            } else {
                server_log("warn", `card:return-to-hand: カード ${card.name} はPlayFieldに見つかりませんでしたが、処理を続行します。`);
            }

            card.location = "hand";
            card.isFaceUp = true;

            player.cards.push(card);

            server_log("card", `カード ${card.name} を持ち主 ${player.name} の手札に戻しました。（room: ${roomId}）`);

            emitDeckUpdate(roomId, deckId);
            emitPlayerUpdate(roomId);
        });

        // トークン獲得イベントのハンドラ（room対応版）
        socket.on('game:acquire-token', (payload) => {
            const { roomId, tokenStoreId, tokenId, tokenName } = payload;

            const roomInfo = activeRooms.get(roomId);
            if (!roomInfo) {
                server_log('warn', `[${roomId}] Room not found.`);
                return;
            }

            const { gameStateInstance } = roomInfo;

            // socket.id からプレイヤーIDを取得
            const player = gameStateInstance.players.find(p => p.socketId === socket.id);
            if (!player) {
                server_log('warn', `[${roomId}] プレイヤーが見つかりません (socket.id: ${socket.id})`);
                return;
            }
            const playerId = player.id;

            server_log('token', `[${roomId}] Player ${player.name} attempts to acquire token: ${tokenName} (Store: ${tokenStoreId}, ID: ${tokenId})`);

            const success = gameStateInstance.acquireToken(tokenStoreId, playerId, tokenId);

            if (success) {
                if (tokenStoreId !== 'scoreboard-acquisition') {
                    const updatedTokens = gameStateInstance.getTokenStore(tokenStoreId)?.getTokens();
                    if (updatedTokens) {
                        io.to(roomId).emit(`token-store:update:${roomId}:${tokenStoreId}`, updatedTokens);
                        server_log('token', `[${roomId}] ストア ${tokenStoreId} の更新 (${updatedTokens.length} 個) をブロードキャストしました。`);
                    }
                }

                emitPlayerUpdate(roomId);
                io.to(roomId).emit('game:state-update', gameStateInstance.getFullState());
            } else {
                server_log('warn', `[${roomId}] Failed to acquire token ${tokenId}. It might not exist or logic failed.`);
                const currentTokens = gameStateInstance.getTokenStore(tokenStoreId)?.getTokens();
                if (currentTokens) {
                    socket.emit(`token-store:update:${roomId}:${tokenStoreId}`, currentTokens);
                }
            }
        });

        // 次のターン
        socket.on("game:next-turn", ({ roomId }) => {
            const roomInfo = activeRooms.get(roomId);
            if (!roomInfo) {
                server_log("warn", `[${roomId}] ルームが見つかりません for next-turn`);
                return;
            }

            const { gameStateInstance } = roomInfo;
            roomInfo.currentTurnIndex = (roomInfo.currentTurnIndex + 1) % gameStateInstance.players.length;

            server_log("game", `[${roomId}] 次のターン: ${gameStateInstance.players[roomInfo.currentTurnIndex]?.name}`);
            io.to(roomId).emit("game:turn", gameStateInstance.players[roomInfo.currentTurnIndex]?.id);
        });

        socket.on("require-popup", ({ roomId, message, color = "blue" }) => {
            server_log("popup", `[${roomId}] 全員にポップアップ要求: ${message} (色: ${color})`);
            
            const popupContent = {
                message: message,
                color: color,
                timestamp: Date.now()
            };
            
            io.to(roomId).emit("client:show-popup", popupContent);
        });

        // 接続切断処理
        socket.on('disconnect', async () => {
            server_log('disconnect', `クライアント切断: ${socket.id}`);
            
            // 1. 切断されたソケットが参加していたゲームルームを特定
            // Socket.IOは切断時に自動でルームを抜けますが、disconnectingイベントで参加していたルームを取得できます。
            // しかし、ここではルーム参加時にプレイヤーオブジェクトにroomIdを保持していないため、
            // activeRooms全体をチェックして、このsocketIdを持つプレイヤーがいたルームを探します。

            let disconnectedRoomId = null;
            let disconnectingPlayer = null;

            for (const [roomId, roomInfo] of activeRooms.entries()) {
                const playerIndex = roomInfo.gameStateInstance.players.findIndex(p => p.socketId === socket.id);
                if (playerIndex !== -1) {
                    disconnectedRoomId = roomId;
                    disconnectingPlayer = roomInfo.gameStateInstance.players[playerIndex];
                    // プレイヤーリストから削除（非アクティブ化）
                    roomInfo.gameStateInstance.players.splice(playerIndex, 1);
                    server_log("room", `[${roomId}] プレイヤー ${disconnectingPlayer.name} (${disconnectingPlayer.id}) をリストから削除しました。`);
                    break;
                }
            }

            if (disconnectedRoomId) {
                // プレイヤーリストの更新をブロードキャスト
                emitPlayerUpdate(disconnectedRoomId);

                // 2. ルームに残っている接続中のソケットの数をチェック
                // Socket.IO v3/v4では io.in(roomId).fetchSockets() でルーム内のソケットを取得できます。
                const socketsInRoom = await io.in(disconnectedRoomId).fetchSockets();
                
                server_log("room", `[${disconnectedRoomId}] 残りソケット数: ${socketsInRoom.length}`);

                // 3. 残りソケット数が0であればルームをクリーンアップ
                if (socketsInRoom.length === 0) {
                    activeRooms.delete(disconnectedRoomId);
                    server_log("room", `[${disconnectedRoomId}] 誰もいなくなったため、ルームをアクティブリストから削除しました。`);
                    // ロビーリストの更新を通知
                    io.emit('lobby:room-update'); 
                } else {
                     // ターンプレイヤーが切断した場合、次のターンへ
                     const roomInfo = activeRooms.get(disconnectedRoomId);
                     if (roomInfo && disconnectingPlayer && roomInfo.gameStateInstance.players.length > 0) {
                         // 切断されたプレイヤーが現在のターンプレイヤーだった場合、ターンをスキップ（次のプレイヤーに移動）
                         const currentTurnPlayer = roomInfo.gameStateInstance.players[roomInfo.currentTurnIndex];
                         if (currentTurnPlayer && currentTurnPlayer.id === disconnectingPlayer.id) {
                            roomInfo.currentTurnIndex = roomInfo.currentTurnIndex % roomInfo.gameStateInstance.players.length; // 新しいプレイヤー数に基づいてインデックスを調整
                            server_log("game", `[${disconnectedRoomId}] ターンプレイヤーが切断したため、次のターンへ移行します: ${roomInfo.gameStateInstance.players[roomInfo.currentTurnIndex]?.name}`);
                            io.to(disconnectedRoomId).emit("game:turn", roomInfo.gameStateInstance.players[roomInfo.currentTurnIndex]?.id);
                         }
                     }
                }
            }
        });
    });
}
