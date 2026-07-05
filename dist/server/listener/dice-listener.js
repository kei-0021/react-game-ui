import { RoomManager } from '../room-manager.js';
export function registerDiceListeners(socket, io, gameParams, activeRooms) {
    socket.on('dice:roll', ({ roomId, diceId }) => {
        const state = activeRooms.get(roomId);
        if (!state)
            return;
        const param = gameParams[state.gameId];
        const roomManager = new RoomManager(io, param, state);
        const value = roomManager.rollDice(diceId);
        const data = {
            diceId: diceId,
            value: value,
        };
        io.to(roomId).emit(`dice:update`, data);
    });
}
