// src/server/listener/dice-listener.ts
import { GameParam, RoomState } from '@/index.js';
import { GameId, RoomId } from '@/types/definition.js';
import { DiceRollData, DiceUpdateData } from '@/types/socketData.js';
import { Server, Socket } from 'socket.io';
import { RoomManager } from '../room-manager.js';

export function registerDiceListeners(
  socket: Socket,
  io: Server,
  gameParams: Record<GameId, GameParam>,
  activeRooms: Map<RoomId, RoomState>,
) {
  socket.on('dice:roll', ({ roomId, diceId }: DiceRollData) => {
    const state = activeRooms.get(roomId);
    if (!state) return;
    const param = gameParams[state.gameId];
    const roomManager = new RoomManager(io, param, state);

    const value = roomManager.rollDice(diceId);

    const data: DiceUpdateData = {
      diceId: diceId,
      value: value,
    };
    io.to(roomId).emit(`dice:update`, data);
  });
}
