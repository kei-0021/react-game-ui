import { RoomManager } from '../room-manager.js';
/**
 * ボード操作専用のイベントリスナーを登録する。
 * コマの移動・移動可能範囲の計算を行うアクションを制御する。
 */
export function registerBoardListeners(socket, io, gameParams, activeRooms) {
    // 駒の移動
    socket.on('board:move-piece', ({ roomId, boardId, pieceId, newLocation }) => {
        const state = activeRooms.get(roomId);
        if (!state)
            return;
        const param = gameParams[state.gameId];
        const roomManager = new RoomManager(io, param, state);
        // 全駒リスト (extraPieces) から検索
        const piece = state.pieces[pieceId];
        if (piece) {
            // 駒の座標を更新
            piece.position = newLocation;
            // セル効果
            const cellEffects = param.cellEffects;
            if (cellEffects) {
                roomManager.applyCellEffect(boardId, pieceId, newLocation, cellEffects);
            }
            // カスタムフック
            const onPieceMove = param.onPieceMove;
            if (onPieceMove) {
                onPieceMove(state, roomManager, newLocation);
            }
            // 盤面全体を同期（すべての駒の状態を送る）
            io.to(roomId).emit('board:update', {
                board: state.boards[boardId], // ボードID指定で送るのが安全
                players: state.players,
                extraPieces: Object.values(state.pieces),
            });
        }
    });
    // 駒の移動可能範囲リクエスト
    socket.on('board:movable-range', ({ roomId, boardId, playerId: pieceId, moveRange, isExact }) => {
        const state = activeRooms.get(roomId);
        if (!state)
            return;
        const param = gameParams[state.gameId];
        const roomManager = new RoomManager(io, param, state);
        // 指定された pieceId の駒を取得
        const piece = state.pieces[pieceId];
        if (!piece)
            return;
        const { row, col } = piece.position;
        const startCellId = `r${row}c${col}`;
        // 移動範囲を計算
        const movableIds = roomManager.getMovableCellIds(boardId, startCellId, moveRange, isExact);
        // 位置情報形式に変換
        const movableLocs = movableIds.map((id) => {
            const m = id.match(/r(\d+)c(\d+)/);
            return {
                row: parseInt(m[1], 10),
                col: parseInt(m[2], 10),
            };
        });
        // 駒自体に移動可能範囲をセット（フロントがこれを参照する）
        piece.movableCells = movableLocs;
        // 更新を通知
        io.to(roomId).emit('board:update', {
            board: state.boards[boardId],
            players: state.players,
            extraPieces: Object.values(state.pieces),
        });
    });
}
