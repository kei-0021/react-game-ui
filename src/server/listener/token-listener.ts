// src/server/listner/token-lister.ts
import { GameParam, RoomState } from '@/index.js';
import { GameId, RoomId } from '@/types/definition.js';
import { TokenAcquireData, TokenMoveFromBoardData } from '@/types/socketData.js';
import { TokenData } from '@/types/token.js';
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
    const piece = state?.pieces[tokenId];
    if (state && player) {
      const token: TokenData = {
        id: tokenId,
        name: '',
        imageSrc: '',
        color: 'white',
      };
      player.tokens.push(token);
      roomManager.emitPlayerUpdate();
    }
  });
}
