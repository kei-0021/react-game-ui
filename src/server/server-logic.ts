// src/server/server-logic.ts
import { GameParam, RoomState } from '@/index.js';
import { RoomId } from '@/types/definition.js';
import { LobbyGameList, LobbyRoomList, ObjectBringToData, RoomMeta } from '@/types/socketData.js';
import { Server, Socket } from 'socket.io';
import { registerBoardListeners } from './listener/board-listener.js';
import { registerDeckListeners } from './listener/deck-listener.js';
import { registerDiceListeners } from './listener/dice-listener.js';
import { registerDraggableListeners } from './listener/draggable-listener.js';
import { registerPlayerListeners } from './listener/player-listener.js';
import { registerRoomListeners } from './listener/room-listener.js';
import { registerTimerListeners } from './listener/timer-listener.js';
import { registerTokenListeners } from './listener/token-listener.js';
import { LOG_CATEGORIES, setLogLevel } from './log/logger.js';
import { RoomManager } from './room-manager.js';
import type { GameServerOptions } from './server.js';

export function initGameServer(io: Server, options: GameServerOptions, activeRooms: Map<RoomId, RoomState>) {
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

  if (options.initialLogLevel) {
    setLogLevel(options.initialLogLevel);

    const blue = '\x1b[36m';
    const reset = '\x1b[0m';
    console.log(`[log] ログレベルを初期化しました: ${blue}${options.initialLogLevel}${reset}`);
  }

  io.on('connection', (socket: Socket) => {
    // ロビー
    socket.on('lobby:get-info', () => {
      const gameList: GameParam[] = Object.keys(gameParams).map((id) => ({
        gameId: id,
        gameIcon: gameParams[id].gameIcon,
        maxPlayers: gameParams[id].maxPlayers,
        initialHand: gameParams[id].initialHand,
        initialTokens: gameParams[id].initialTokens,
        draggables: gameParams[id].draggables,
        components: gameParams[id].components,
      }));

      const roomList: RoomMeta[] = [];
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
      } as LobbyGameList);
      socket.emit('lobby:room-list', {
        rooms: roomList,
      } as LobbyRoomList);
    });

    // ルーム進行関連
    registerRoomListeners(socket, io, gameParams, activeRooms);

    // デッキ関連
    registerDeckListeners(socket, io, gameParams, activeRooms);

    // トークン関連
    registerTokenListeners(socket, io, gameParams, activeRooms);

    // ボード関連
    registerBoardListeners(socket, io, gameParams, activeRooms);

    // ダイス関連
    registerDiceListeners(socket, io, gameParams, activeRooms);

    // ドラッグ可能オブジェクト関連
    registerDraggableListeners(socket, io, gameParams, activeRooms);

    // タイマー関連
    registerTimerListeners(socket, io, gameParams, activeRooms);

    // プレイヤー要素関連
    registerPlayerListeners(socket, io, gameParams, activeRooms);

    socket.on('cursor:move', ({ roomId, x, y }) => {
      socket.to(roomId).emit('cursor:update', { playerId: socket.id, x, y });
    });

    // 重ね順更新
    socket.on('object:bring-to', ({ roomId, objectId, type, isFront }: ObjectBringToData) => {
      const state = activeRooms.get(roomId);
      if (!state) return;
      const param = gameParams[state.gameId];
      const roomManager = new RoomManager(io, param, state);

      roomManager.updateZIndex(type, objectId, isFront);
    });

    // --- カスタムイベント ---
    const customEvents = options.customEvents ? options.customEvents() : {};
    for (const [event, handler] of Object.entries(customEvents)) {
      socket.on(event, (data) => {
        try {
          (handler as Function)(socket, data);
        } catch (err) {
          console.log('warn', 'Custom Event Error', err);
        }
      });
    }
  });
}
