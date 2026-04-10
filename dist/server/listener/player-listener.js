import { RoomManager } from '../room-manager.js';
export function registerPlayerListeners(socket, io, gameParams, activeRooms) {
    // スコア加算
    socket.on('player:add-score', ({ roomId, targetPlayerId, points }) => {
        const state = activeRooms.get(roomId);
        if (!state)
            return;
        const param = gameParams[state.gameId];
        const roomManager = new RoomManager(io, param, state);
        roomManager.addScore(targetPlayerId, points);
    });
    // リソース加算
    socket.on('player:update-resource', ({ roomId, playerId, resourceId, amount }) => {
        const state = activeRooms.get(roomId);
        if (!state)
            return;
        const param = gameParams[state.gameId];
        const roomManager = new RoomManager(io, param, state);
        roomManager.acquireResource(playerId, resourceId, amount);
    });
}
