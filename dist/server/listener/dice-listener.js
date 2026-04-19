import { RoomManager } from '../room-manager.js';
export function registerDiceListeners(socket, io, gameParams, activeRooms) {
    socket.on('dice:roll', ({ roomId, diceId, sides }) => {
        const state = activeRooms.get(roomId);
        if (!state)
            return;
        const param = gameParams[state.gameId];
        const roomManager = new RoomManager(io, param, state);
        const data = {
            value: Math.floor(Math.random() * sides) + 1,
        };
        roomManager.server_log('dice', `Dice ${diceId} rolled. Result: ${data.value}`);
        io.to(roomId).emit(`dice:update:${diceId}`, data);
    });
}
