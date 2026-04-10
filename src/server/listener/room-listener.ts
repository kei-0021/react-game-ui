// src/server/listener/room-listener.ts
import { GameParam, RoomState } from '@/index.js';
import { GameId, RoomId } from '@/types/definition.js';
import { GameComponentData, RoomJoinData } from '@/types/socketData.js';
import { Server, Socket } from 'socket.io';
import { server_log } from '../logger.js';
import { createPlayer, createState } from '../logic/create-state.js';
import { syncState } from '../logic/sync-state.js';
import { RoomManager } from '../room-manager.js';

export function registerRoomListeners(
  socket: Socket,
  io: Server,
  gameParams: Record<GameId, GameParam>,
  activeRooms: Map<RoomId, RoomState>,
) {
  // ルーム参加
  socket.on('room:join', async ({ roomId, playerName, gameId }: RoomJoinData) => {
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
    } else {
      newPlayer.socketId = socket.id;
    }

    // コンポーネント情報を伝える
    socket.emit('game:component', {
      state: state,
      components: param.components,
    } as GameComponentData);

    // 準備完了を促す
    socket.emit('client:ready-to-sync', newPlayer.id);
  });

  // 準備完了を受けた同期処理
  socket.on('client:ready', (roomId) => {
    const state = activeRooms.get(roomId);
    if (!state) return;
    const param = gameParams[state.gameId];
    const roomManager = new RoomManager(io, param, state);
    syncState(state, roomManager, io);
  });

  socket.on('disconnect', () => {
    for (const [id, state] of activeRooms.entries()) {
      const idx = state.players.findIndex((p) => p.socketId === socket.id);
      if (idx !== -1) {
        state.players.splice(idx, 1);
        if (state.players.length === 0) {
          activeRooms.delete(id);
          io.emit('room-ready');
        } else {
          const param = gameParams[state.gameId];
          const roomManager = new RoomManager(io, param, state);
          roomManager.emitPlayerUpdate();
        }
        break;
      }
    }
  });
}
