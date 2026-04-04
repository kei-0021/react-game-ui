// src/server/listner/token-lister.ts
import { GameId, RoomId } from '@/types/definition.js';
import { GameParam, RoomState } from '@/types/server.js';
import { TokenAcquireData } from '@/types/socketData.js';
import { Server, Socket } from 'socket.io';
import { RoomManager } from '../room-manager.js';

export function registerTokenListeners(
  socket: Socket,
  io: Server,
  gameParams: Record<GameId, GameParam>,
  activeRooms: Map<RoomId, RoomState>,
) {
  // トークン
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
}
