// src/server/listner/token-lister.ts
import { GameParam, RoomState } from '@/index.js';
import { GameId, RoomId } from '@/types/definition.js';
import { TokenAcquireData, TokenMoveFromBoardData } from '@/types/socketData.js';
import { Server, Socket } from 'socket.io';
import { RoomManager } from '../room-manager.js';

export function registerTokenListeners(
  socket: Socket,
  io: Server,
  gameParams: Record<GameId, GameParam>,
  activeRooms: Map<RoomId, RoomState>,
) {
  // トークン獲得
  socket.on('token:aquire', ({ roomId, tokenStoreId, tokenId }: TokenAcquireData) => {
    const state = activeRooms.get(roomId);
    if (!state) return;
    const param = gameParams[state.gameId];
    const roomManager = new RoomManager(io, param, state);

    const player = state?.players.find((p) => p.socketId === socket.id);
    if (state && player) {
      roomManager.acquireToken(tokenStoreId, tokenId, player.id);
      roomManager.emitPlayerUpdate();
    }
  });

  // 盤面からトークンを戻す
  socket.on('token:move-from-board', ({ roomId, boardId, tokenId }: TokenMoveFromBoardData) => {
    const state = activeRooms.get(roomId);
    if (!state) return;
    const param = gameParams[state.gameId];
    const roomManager = new RoomManager(io, param, state);

    const player = state?.players.find((p) => p.socketId === socket.id);
    const token = state?.boardTokens[tokenId];
    if (state && player) {
      // 属性を書き換える
      token.ownerId = player.id;
      token.position = null;
      token.movableCells = [];

      // トークンの所在を書き換える
      player.tokens.push(token);
      delete state?.boardTokens[tokenId];

      // 更新を通知
      roomManager.emitPlayerUpdate();
      roomManager.emitBoardUpdate(boardId);
    }
  });
}
