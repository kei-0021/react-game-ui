import { applyCellEffect, createRandomBoard, generateColorFromId, markCellAsExplored, RoomManager, server_log, unmarkCellAsExplored, } from './server-utils.js';
const activeRooms = new Map();
const roomTimers = new Map();
// --- ルームメタ情報取得 ---
function getRoomMeta(roomId) {
    const roomState = activeRooms.get(roomId);
    if (!roomState)
        return null;
    return {
        id: roomId,
        gameName: roomState.gameName,
        playerCount: roomState.initRoomState.players.length,
        maxPlayers: 4,
        createdAt: roomState.createdAt,
    };
}
// --- ルーム初期化 ---
function initializeRoom(roomId, settings) {
    const initialDecks = settings.initialDecks || [];
    const initialResources = settings.initialResources || [];
    const initialTokenStores = Array.isArray(settings.initialTokenStores) ? settings.initialTokenStores : [];
    const initialTokens = settings.initialTokens || [];
    const initialBoard = settings.initialBoard || [];
    const Cells = createRandomBoard(initialBoard);
    const initialParam = {
        players: [],
        initialResources,
        initialTokenStores,
        initialTokens,
        board: Cells,
        exploredCells: [],
        turn: 1,
    };
    const initRoomState = new RoomManager(initialParam, initialTokenStores);
    // これで acquireToken が呼べるようになりま
    const decks = {};
    const drawnCards = {};
    const playFieldCards = {};
    const discardPile = {};
    initialDecks.forEach((deck) => {
        const cards = (deck.cards || []).map((c, index) => ({
            ...c,
            deckId: deck.deckId,
            backColor: deck.backColor,
            instanceId: `${roomId}_${deck.deckId}_${index}`,
            location: 'deck',
            ownerId: null,
            coordinate: { x: 50, y: 50 },
        }));
        decks[deck.deckId] = cards;
        drawnCards[deck.deckId] = [];
        playFieldCards[deck.deckId] = [];
        discardPile[deck.deckId] = [];
        server_log('deck', settings.name || 'Standard', roomId, `デッキ "${deck.deckId}" 初期化完了`);
    });
    const roomState = {
        roomId,
        createdAt: Date.now(),
        gameName: settings.name || '不明なゲーム',
        currentTurnIndex: 0,
        currentRoundIndex: 0,
        decks,
        drawnCards,
        playFieldCards,
        discardPile,
        initRoomState: initRoomState,
        checkGameEnd: settings.checkGameEnd,
        onGameEnd: settings.onGameEnd,
    };
    activeRooms.set(roomId, roomState);
    server_log('room', roomState.gameName, roomId, `ルーム初期化完了`);
    return roomState;
}
export function initGameServer(io, options = {}) {
    const gamePresets = options.gamePresets || {};
    const cellEffects = options.cellEffects || {};
    // --- ヘルパー関数 ---
    const emitPlayerUpdate = (roomId) => {
        const roomInfo = activeRooms.get(roomId);
        if (roomInfo)
            io.to(roomId).emit('players:update', roomInfo.initRoomState.players);
    };
    const emitDeckUpdate = (roomId, deckId) => {
        const roomInfo = activeRooms.get(roomId);
        if (!roomInfo)
            return;
        io.to(roomId).emit(`deck:update:${roomId}:${deckId}`, {
            currentDeck: roomInfo.decks[deckId].filter((c) => c.location === 'deck'),
            drawnCards: roomInfo.drawnCards[deckId],
            playFieldCards: roomInfo.playFieldCards[deckId],
            discardPile: roomInfo.discardPile[deckId],
        });
        emitPlayerUpdate(roomId);
    };
    const addScore = (roomId, playerId, points) => {
        const roomInfo = activeRooms.get(roomId);
        const player = roomInfo?.initRoomState.players.find((p) => p.id === playerId);
        if (player) {
            player.score = (player.score || 0) + points;
            server_log('addScore', roomInfo.gameName, roomId, `${player.name} に ${points}pt 加算`);
            emitPlayerUpdate(roomId);
        }
    };
    const updatePlayerResource = (roomId, playerId, resourceId, amount) => {
        const roomInfo = activeRooms.get(roomId);
        const player = roomInfo?.initRoomState.players.find((p) => p.id === playerId);
        const resource = player?.resources?.find((r) => r.id === resourceId);
        if (resource) {
            resource.currentValue = Math.min(resource.maxValue, Math.max(0, resource.currentValue + amount));
            server_log('resource', roomInfo.gameName, roomId, `${player.name}: ${resource.name} 更新`);
            emitPlayerUpdate(roomId);
            return true;
        }
        return false;
    };
    const updatePlayerToken = (roomId, playerId, tokenId, amount) => {
        const roomInfo = activeRooms.get(roomId);
        const player = roomInfo?.initRoomState.players.find((p) => p.id === playerId);
        const token = player?.tokens?.find((t) => t.id === tokenId);
        if (token) {
            token.count = Math.max(0, (token.count || 0) + amount);
            server_log('token', roomInfo.gameName, roomId, `${player.name}: ${tokenId} 更新`);
            emitPlayerUpdate(roomId);
            return true;
        }
        return false;
    };
    const stopTimer = (roomId, gameName) => {
        const timer = roomTimers.get(roomId);
        if (timer) {
            clearTimeout(timer);
            roomTimers.delete(roomId);
            server_log('timer', gameName, roomId, `タイマー停止`);
        }
    };
    const shuffleDeck = (roomId, deckId) => {
        const roomInfo = activeRooms.get(roomId);
        if (!roomInfo || !roomInfo.decks[deckId])
            return;
        const currentDeck = roomInfo.decks[deckId].filter((c) => c.location === 'deck');
        const otherCards = roomInfo.decks[deckId].filter((c) => c.location !== 'deck');
        for (let i = currentDeck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [currentDeck[i], currentDeck[j]] = [currentDeck[j], currentDeck[i]];
        }
        roomInfo.decks[deckId] = currentDeck.concat(otherCards);
    };
    io.on('connection', (socket) => {
        // ロビー
        socket.on('lobby:get-rooms', () => {
            const roomList = Array.from(activeRooms.keys()).map(getRoomMeta).filter(Boolean);
            socket.emit('lobby:rooms-list', roomList);
        });
        // 参加
        socket.on('room:join', async ({ roomId, playerName, gamePresetId }) => {
            if (!roomId)
                return;
            let roomInfo = activeRooms.get(roomId);
            const roomSettings = gamePresets[gamePresetId] || options;
            if (!roomInfo) {
                roomInfo = initializeRoom(roomId, { ...roomSettings, name: gamePresetId });
                Object.keys(roomInfo.decks).forEach((id) => shuffleDeck(roomId, id));
                io.emit('lobby:room-update');
            }
            await socket.join(roomId);
            const { initRoomState: gameParam, decks } = roomInfo;
            let player = gameParam.players.find((p) => p.socketId === socket.id);
            if (!player) {
                player = {
                    id: `${roomId}_p${gameParam.players.length + 1}`,
                    name: playerName?.trim() || `Player ${gameParam.players.length + 1}`,
                    color: generateColorFromId(`${roomId}_p${gameParam.players.length + 1}`),
                    socketId: socket.id,
                    cards: [],
                    score: 0,
                    resources: JSON.parse(JSON.stringify(roomSettings.initialResources || [])),
                    tokens: JSON.parse(JSON.stringify(roomSettings.initialTokens || [])),
                    position: { row: 0, col: 0 },
                };
                gameParam.players.push(player);
                const hand = roomSettings.initialHand;
                if (hand && decks[hand.deckId]) {
                    const target = decks[hand.deckId];
                    for (let i = 0; i < hand.count; i++) {
                        const idx = target.findIndex((c) => c.location === 'deck');
                        if (idx === -1)
                            break;
                        target[idx].location = 'hand';
                        target[idx].ownerId = player.id;
                        player.cards.push(target[idx]);
                    }
                }
            }
            else {
                player.socketId = socket.id;
            }
            socket.emit('player:assign-id', player.id);
            socket.emit('game:init-board', gameParam.board);
            Object.keys(decks).forEach((id) => emitDeckUpdate(roomId, id));
            if (gameParam.exploredCells.length > 0)
                socket.emit('board-update', gameParam.exploredCells);
        });
        // 移動・探索
        socket.on('game:move-player', ({ roomId, playerId, newPosition }) => {
            const roomState = activeRooms.get(roomId);
            const player = roomState?.initRoomState.players.find((p) => p.id === playerId);
            if (player && roomState) {
                player.position = newPosition;
                const updated = markCellAsExplored(roomState.initRoomState, roomState.gameName, roomId, newPosition);
                applyCellEffect(roomState.initRoomState, roomState.gameName, roomId, playerId, newPosition, cellEffects, (pId, pts) => addScore(roomId, pId, pts), (pId, rId, amt) => updatePlayerResource(roomId, pId, rId, amt), (pId, tId, amt) => updatePlayerToken(roomId, pId, tId, amt), ({ message, color }) => io.to(roomId).emit('client:show-popup', { message, color, timestamp: Date.now() }));
                emitPlayerUpdate(roomId);
                if (updated)
                    io.to(roomId).emit('board-update', roomState.initRoomState.exploredCells);
            }
        });
        socket.on('game:explore-cell', ({ roomId, targetPosition }) => {
            const roomInfo = activeRooms.get(roomId);
            if (roomInfo && markCellAsExplored(roomInfo.initRoomState, roomInfo.gameName, roomId, targetPosition)) {
                io.to(roomId).emit('board-update', roomInfo.initRoomState.exploredCells);
            }
        });
        socket.on('game:unexplore-cell', ({ roomId, targetPosition }) => {
            const roomInfo = activeRooms.get(roomId);
            if (roomInfo && unmarkCellAsExplored(roomInfo.initRoomState, roomInfo.gameName, roomId, targetPosition)) {
                io.to(roomId).emit('board-update', roomInfo.initRoomState.exploredCells);
            }
        });
        // デッキ操作
        socket.on('deck:draw', ({ roomId, deckId, playerId, drawLocation = 'hand' }) => {
            const roomInfo = activeRooms.get(roomId);
            if (!roomInfo || !roomInfo.decks[deckId])
                return;
            const deck = roomInfo.decks[deckId].filter((c) => c.location === 'deck');
            if (deck.length === 0)
                return;
            const card = deck[0];
            if (drawLocation === 'discard') {
                card.location = 'discard';
                roomInfo.discardPile[deckId].push(card);
            }
            else if (playerId) {
                const p = roomInfo.initRoomState.players.find((p) => p.id === playerId);
                if (p) {
                    card.location = drawLocation;
                    card.ownerId = playerId;
                    p.cards.push(card);
                }
            }
            else {
                card.location = 'field';
                roomInfo.playFieldCards[deckId].push(card);
            }
            server_log('deck', roomInfo.gameName, roomId, `DRAW: ${card.name}`);
            emitDeckUpdate(roomId, deckId);
        });
        socket.on('deck:reset', ({ roomId, deckId }) => {
            const roomInfo = activeRooms.get(roomId);
            if (!roomInfo)
                return;
            roomInfo.decks[deckId].forEach((c) => {
                if (c.location === 'discard') {
                    c.location = 'deck';
                    c.isFaceUp = false;
                    c.ownerId = null;
                }
            });
            roomInfo.discardPile[deckId] = [];
            shuffleDeck(roomId, deckId);
            emitDeckUpdate(roomId, deckId);
        });
        // カード位置同期 (不具合修正版)
        socket.on('card:move-on-field', ({ roomId, deckId, cardId, coordinate }) => {
            const roomInfo = activeRooms.get(roomId);
            const card = roomInfo?.decks[deckId]?.find((c) => c.id === cardId);
            if (card) {
                card.coordinate = coordinate;
                emitDeckUpdate(roomId, deckId);
            }
        });
        socket.on('card:play', ({ roomId, deckId, cardIds, playerId, playLocation = 'field', coordinate }) => {
            const roomInfo = activeRooms.get(roomId);
            if (!roomInfo)
                return;
            const ids = Array.isArray(cardIds) ? cardIds : [cardIds];
            ids.forEach((id) => {
                const card = roomInfo.decks[deckId]?.find((c) => c.id === id);
                if (!card)
                    return;
                if (playerId) {
                    const p = roomInfo.initRoomState.players.find((p) => p.id === playerId);
                    if (p)
                        p.cards = p.cards.filter((c) => c.id !== id);
                }
                card.location = playLocation;
                if (coordinate?.x != null && coordinate?.y != null) {
                    card.coordinate = coordinate;
                    server_log('card', roomInfo.gameName, roomId, `Update Coord: x=${coordinate.x}, y=${coordinate.y}`);
                }
                card.isFaceUp = true;
                roomInfo.playFieldCards[deckId] = roomInfo.playFieldCards[deckId].filter((c) => c.id !== id);
                roomInfo.discardPile[deckId] = roomInfo.discardPile[deckId].filter((c) => c.id !== id);
                if (playLocation === 'discard') {
                    roomInfo.discardPile[deckId].push(card);
                }
                else {
                    roomInfo.playFieldCards[deckId].push(card);
                }
            });
            emitDeckUpdate(roomId, deckId);
        });
        // ドラッグ中も監視
        socket.on('card:move-on-field', ({ roomId, deckId, cardId, coordinate }) => {
            const roomInfo = activeRooms.get(roomId);
            const card = roomInfo?.decks[deckId]?.find((c) => c.id === cardId);
            if (card && coordinate) {
                card.coordinate = coordinate;
                emitDeckUpdate(roomId, deckId);
            }
        });
        socket.on('card:reveal', ({ roomId, playerId, cardIds }) => {
            const roomInfo = activeRooms.get(roomId);
            const p = roomInfo?.initRoomState.players.find((p) => p.id === playerId);
            if (p) {
                const ids = Array.isArray(cardIds) ? cardIds : [cardIds];
                p.cards.forEach((c) => {
                    if (ids.includes(c.id))
                        c.isFaceUp = true;
                });
                emitPlayerUpdate(roomId);
            }
        });
        // トークン・ダイス
        socket.on('game:acquire-token', ({ roomId, tokenStoreId, tokenId }) => {
            const roomInfo = activeRooms.get(roomId);
            const player = roomInfo?.initRoomState.players.find((p) => p.socketId === socket.id);
            if (roomInfo &&
                player &&
                roomInfo.initRoomState.acquireToken(tokenStoreId, roomInfo.gameName, roomId, player.id, tokenId)) {
                const store = roomInfo.initRoomState.getTokenStore(tokenStoreId);
                if (store)
                    io.to(roomId).emit(`token-store:update:${roomId}:${tokenStoreId}`, store.getTokens());
                emitPlayerUpdate(roomId);
            }
        });
        socket.on('dice:roll', ({ roomId, diceId, sides }) => {
            const roomInfo = activeRooms.get(roomId);
            if (roomInfo) {
                const val = Math.floor(Math.random() * sides) + 1;
                io.to(roomId).emit(`dice:rolled:${roomId}:${diceId}`, val);
            }
        });
        // タイマー・その他同期
        socket.on('timer:start', ({ duration, roomId }) => {
            const roomInfo = activeRooms.get(roomId);
            if (!roomInfo)
                return;
            stopTimer(roomId, roomInfo.gameName);
            let rem = duration;
            io.to(roomId).emit('timer:start', { duration, roomId });
            const tick = () => {
                if (rem <= 0) {
                    stopTimer(roomId, roomInfo.gameName);
                    io.to(roomId).emit('timer:finish', { roomId });
                    return;
                }
                io.to(roomId).emit('timer:update', { remaining: rem, roomId });
                rem--;
                roomTimers.set(roomId, setTimeout(tick, 1000));
            };
            tick();
        });
        socket.on('cursor:move', ({ roomId, x, y }) => {
            socket.to(roomId).emit('cursor:update', { playerId: socket.id, x, y });
        });
        socket.on('draggable:moved', (data) => {
            const { roomId, ...move } = data;
            socket.to(roomId).emit('draggable:update', move);
        });
        socket.on('game:next-turn', ({ roomId }) => {
            const roomInfo = activeRooms.get(roomId);
            if (roomInfo && roomInfo.initRoomState.players.length > 0) {
                const nextIdx = (roomInfo.currentTurnIndex + 1) % roomInfo.initRoomState.players.length;
                if (nextIdx === 0)
                    roomInfo.currentRoundIndex++;
                roomInfo.currentTurnIndex = nextIdx;
                const curr = roomInfo.initRoomState.players[nextIdx];
                io.to(roomId).emit('game:turn', {
                    playerId: curr.id,
                    currentRound: roomInfo.currentRoundIndex,
                    currentTurnIndex: nextIdx,
                });
            }
        });
        // --- カスタムイベント ---
        const customEvents = options.customEvents ? options.customEvents() : {};
        for (const [event, handler] of Object.entries(customEvents)) {
            socket.on(event, (data) => {
                try {
                    handler(socket, data);
                }
                catch (err) {
                    console.log('warn', 'Custom Event Error', err);
                }
            });
        }
        socket.on('disconnect', () => {
            for (const [id, info] of activeRooms.entries()) {
                const idx = info.initRoomState.players.findIndex((p) => p.socketId === socket.id);
                if (idx !== -1) {
                    info.initRoomState.players.splice(idx, 1);
                    if (info.initRoomState.players.length === 0) {
                        activeRooms.delete(id);
                        io.emit('lobby:room-update');
                    }
                    else {
                        emitPlayerUpdate(id);
                    }
                    break;
                }
            }
        });
    });
}
