// src/server/listener/draggable-listener.ts
import { GameParam, RoomState } from '@/index.js';
import { GameId, RoomId } from '@/types/definition.js';
import { DraggableMovedData } from '@/types/socketData.js';
import { Server, Socket } from 'socket.io';
import { RoomManager } from '../room-manager.js';

export function registerDraggableListeners(
  socket: Socket,
  io: Server,
  gameParams: Record<GameId, GameParam>,
  activeRooms: Map<RoomId, RoomState>,
) {
  socket.on('draggable:moved', ({ roomId, draggableId, coordinate, rotation }: DraggableMovedData) => {
    const state = activeRooms.get(roomId);
    if (!state) return;
    const param = gameParams[state.gameId];
    const roomManager = new RoomManager(io, param, state);

    const draggable = state.draggables[draggableId];
    draggable.coordinate = coordinate;
    draggable.rotation = rotation;

    roomManager.emitDraggableUpdate(draggableId);
  });
}
