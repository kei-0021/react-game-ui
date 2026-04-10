import { RoomManager } from '../room-manager.js';
export function registerDraggableListeners(socket, io, gameParams, activeRooms) {
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
}
