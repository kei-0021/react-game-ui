import { RoomManager } from '../room-manager.js';
export function registerDiceListeners(socket, io, gameParams, activeRooms) {
    socket.on('dice:roll', ({ roomId, diceId, sides }) => {
        const state = activeRooms.get(roomId);
        if (!state)
            return;
        const param = gameParams[state.gameId];
        const roomManager = new RoomManager(io, param, state);
        const value = Math.floor(Math.random() * sides) + 1;
        state.dice[diceId].currentValue = value;
        const data = {
            diceId: diceId,
            value: value,
        };
        if (param.onDiceRoll) {
            param.onDiceRoll(value, roomManager);
        }
        roomManager.server_log('dice', `Dice ${diceId} rolled. Result: ${value}`);
        io.to(roomId).emit(`dice:update`, data);
    });
}
