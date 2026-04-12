import { RoomManager } from '../room-manager.js';
export function registerTokenListeners(socket, io, gameParams, activeRooms) {
    // トークン獲得
    socket.on('token:aquire', ({ roomId, tokenStoreId, tokenId }) => {
        const state = activeRooms.get(roomId);
        if (!state)
            return;
        const param = gameParams[state.gameId];
        const roomManager = new RoomManager(io, param, state);
        const player = state?.players.find((p) => p.socketId === socket.id);
        if (state && player) {
            roomManager.acquireToken(tokenStoreId, tokenId, player.id);
            roomManager.emitPlayerUpdate();
        }
    });
    // 盤面からトークンを戻す
    socket.on('token:move-from-board', ({ roomId, boardId, tokenId }) => {
        const state = activeRooms.get(roomId);
        if (!state)
            return;
        const param = gameParams[state.gameId];
        const roomManager = new RoomManager(io, param, state);
        const player = state?.players.find((p) => p.socketId === socket.id);
        if (state && player) {
            const token = {
                id: '',
                name: '',
                imageSrc: '',
                color: 'white',
            };
            player.tokens.push(token);
            roomManager.emitPlayerUpdate();
        }
    });
}
