// src/server/listener/timer-listener.ts
import { GameParam, RoomState } from '@/index.js';
import { GameId, RoomId } from '@/types/definition.js';
import { Server, Socket } from 'socket.io';
import { RoomManager } from '../room-manager.js';

export function registerTimerListeners(
  socket: Socket,
  io: Server,
  gameParams: Record<GameId, GameParam>,
  activeRooms: Map<RoomId, RoomState>,
) {
  socket.on('timer:start', ({ duration, roomId }) => {
    const state = activeRooms.get(roomId);
    if (!state) return;
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
}
