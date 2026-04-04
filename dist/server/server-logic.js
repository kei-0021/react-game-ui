import { registerBoardListeners } from './listener/board-listener.js';
import { registerDeckListeners } from './listener/deck-listenr.js';
import { registerEditorListeners } from './listener/editor-listner.js';
import { registerTokenListeners } from './listener/token-listener.js';
import { LOG_CATEGORIES, server_log } from './logger.js';
import { createPlayer, createState } from './logic/create-state.js';
import { syncState } from './logic/sync-state.js';
import { RoomManager } from './room-manager.js';
export const activeRooms = new Map();
export function initGameServer(io, options) {
    const gameParams = options.gameParams || {};
    if (options.initialLogCategories) {
        Object.assign(LOG_CATEGORIES, options.initialLogCategories);
        const green = '\x1b[32m';
        const red = '\x1b[31m';
        const reset = '\x1b[0m';
        console.log(`[log] ログカテゴリをオプションで初期化しました。`);
        Object.entries(LOG_CATEGORIES).forEach(([key, value]) => {
            const color = value ? green : red;
            console.log(`${key}: ${color}${value}${reset}`);
        });
    }
    io.on('connection', (socket) => {
        registerEditorListeners(socket, gameParams);
        // ロビー
        socket.on('lobby:get-info', () => {
            const gameList = Object.keys(gameParams).map((id) => ({
                gameId: id,
                gameIcon: gameParams[id].gameIcon,
                maxPlayers: gameParams[id].maxPlayers,
                initialHand: gameParams[id].initialHand,
                initialTokens: gameParams[id].initialTokens,
                draggables: gameParams[id].draggables,
                components: gameParams[id].components,
            }));
            const roomList = [];
            for (const [id, state] of activeRooms) {
                roomList.push({
                    id,
                    gameId: state.gameId,
                    playerCount: state.players.length,
                    maxPlayers: gameParams[state.gameId].maxPlayers,
                    createdAt: state.createdAt,
                });
            }
            // 現在稼働中のルームとゲーム一覧を合わせて送る
            socket.emit('lobby:game-list', {
                games: gameList,
            });
            socket.emit('lobby:room-list', {
                rooms: roomList,
            });
        });
        // ルーム参加
        socket.on('room:join', async ({ roomId, playerName, gameId }) => {
            let state = activeRooms.get(roomId);
            const param = gameParams[gameId];
            // 初回は状態の初期化を行う
            if (!state) {
                state = createState(roomId, { ...param, gameId: gameId });
                activeRooms.set(roomId, state);
                const roomManager = new RoomManager(io, param, state);
                Object.keys(state.decks).forEach((deckId) => roomManager.shuffleDeck(deckId));
                io.emit('room-ready');
            }
            await socket.join(roomId);
            // プレイヤークラスの初期化
            let newPlayer = state.players.find((p) => p.socketId === socket.id);
            if (!newPlayer) {
                newPlayer = createPlayer(param, state, playerName, socket.id);
                state.players.push(newPlayer);
                server_log('room', gameId, roomId, `${newPlayer.name} (${newPlayer.id})が参加しました`);
            }
            else {
                newPlayer.socketId = socket.id;
            }
            // コンポーネント情報を伝える
            socket.emit('game:component', {
                state: state,
                components: param.components,
            });
            // 準備完了を促す
            socket.emit('client:ready-to-sync', newPlayer.id);
        });
        // 準備完了を受けた同期処理
        socket.on('client:ready', (roomId) => {
            const state = activeRooms.get(roomId);
            if (!state)
                return;
            const param = gameParams[state.gameId];
            const roomManager = new RoomManager(io, param, state);
            syncState(state, roomManager, io);
        });
        // デッキ関連
        registerDeckListeners(socket, io, gameParams, activeRooms);
        // トークン関連
        registerTokenListeners(socket, io, gameParams, activeRooms);
        // ボード関連
        registerBoardListeners(socket, io, gameParams, activeRooms);
        // ダイス
        socket.on('dice:roll', ({ roomId, diceId, sides }) => {
            const state = activeRooms.get(roomId);
            if (!state)
                return;
            const param = gameParams[state.gameId];
            const roomManager = new RoomManager(io, param, state);
            const data = {
                value: Math.floor(Math.random() * sides) + 1,
            };
            roomManager.server_log('dice', `Dice ${diceId} rolled. Result: ${data.value}`);
            io.to(roomId).emit(`dice:update:${diceId}`, data);
        });
        // タイマー・その他同期
        socket.on('timer:start', ({ duration, roomId }) => {
            const state = activeRooms.get(roomId);
            if (!state)
                return;
            const param = gameParams[state.gameId];
            const roomManager = new RoomManager(io, param, state);
            roomManager.stopTimer();
            let rem = duration;
            io.to(roomId).emit('timer:start', { duration, roomId });
            const tick = () => {
                if (rem <= 0) {
                    roomManager.stopTimer();
                    io.to(roomId).emit('timer:finish', { roomId });
                    return;
                }
                io.to(roomId).emit('timer:update', { remaining: rem, roomId });
                rem--;
                state.timer = setTimeout(tick, 1000);
            };
            tick();
        });
        socket.on('cursor:move', ({ roomId, x, y }) => {
            socket.to(roomId).emit('cursor:update', { playerId: socket.id, x, y });
        });
        socket.on('draggable:moved', ({ roomId, draggableId, coordinate, rotation }) => {
            const state = activeRooms.get(roomId);
            if (!state)
                return;
            const param = gameParams[state.gameId];
            const roomManager = new RoomManager(io, param, state);
            const draggable = state.draggables[draggableId];
            draggable.coordinate = coordinate;
            draggable.rotation = rotation;
            roomManager.emitDraggableUpdate(draggableId);
        });
        // 重ね順更新
        socket.on('object:bring-to', ({ roomId, objectId, type, isFront }) => {
            const state = activeRooms.get(roomId);
            if (!state)
                return;
            const param = gameParams[state.gameId];
            const roomManager = new RoomManager(io, param, state);
            roomManager.updateZIndex(type, objectId, isFront);
        });
        // 次のターン
        socket.on('game:next-turn', ({ roomId }) => {
            const state = activeRooms.get(roomId);
            if (!state)
                return;
            const param = gameParams[state.gameId];
            const roomManager = new RoomManager(io, param, state);
            roomManager.updateTurn();
        });
        // 次のラウンド
        socket.on('game:next-round', ({ roomId }) => {
            const state = activeRooms.get(roomId);
            if (!state)
                return;
            const param = gameParams[state.gameId];
            const roomManager = new RoomManager(io, param, state);
            roomManager.updateRound();
        });
        // スコア加算
        socket.on('player:add-score', ({ roomId, targetPlayerId, points }) => {
            const state = activeRooms.get(roomId);
            if (!state)
                return;
            const param = gameParams[state.gameId];
            const roomManager = new RoomManager(io, param, state);
            roomManager.addScore(targetPlayerId, points);
        });
        // リソース加算
        socket.on('player:update-resource', ({ roomId, playerId, resourceId, amount }) => {
            const state = activeRooms.get(roomId);
            if (!state)
                return;
            const param = gameParams[state.gameId];
            const roomManager = new RoomManager(io, param, state);
            roomManager.acquireResource(playerId, resourceId, amount);
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
            for (const [id, state] of activeRooms.entries()) {
                const idx = state.players.findIndex((p) => p.socketId === socket.id);
                if (idx !== -1) {
                    state.players.splice(idx, 1);
                    if (state.players.length === 0) {
                        activeRooms.delete(id);
                        io.emit('room-ready');
                    }
                    else {
                        const param = gameParams[state.gameId];
                        const roomManager = new RoomManager(io, param, state);
                        roomManager.emitPlayerUpdate();
                    }
                    break;
                }
            }
        });
    });
}
