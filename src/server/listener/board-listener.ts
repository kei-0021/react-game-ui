// src/server/listner/board-lister.ts
import { GameParam, RoomState } from '@/index.js';
import { GameId, RoomId } from '@/types/definition.js';
import { BaordMoveTokenData, BoardMovableRangeData, BoardUpdateData } from '@/types/socketData.js';
import { Server, Socket } from 'socket.io';
import { RoomManager } from '../room-manager.js';

/**
 * ボード操作専用のイベントリスナーを登録する。
 * コマの移動・移動可能範囲の計算を行うアクションを制御する。
 */
export function registerBoardListeners(
  socket: Socket,
  io: Server,
  gameParams: Record<GameId, GameParam>,
  activeRooms: Map<RoomId, RoomState>,
) {
  // 駒の移動
  socket.on('board:move-piece', ({ roomId, boardId, tokenId, newLocation }: BaordMoveTokenData) => {
    const state = activeRooms.get(roomId);
    if (!state) return;
    const param = gameParams[state.gameId];
    const roomManager = new RoomManager(io, param, state);

    // 全トークンから検索
    const token = state.boardTokens[tokenId];

    if (token) {
      // 座標を更新
      token.position = newLocation;

      // セル効果
      const cellEffects = param.cellEffects;
      if (cellEffects) {
        roomManager.applyCellEffect(boardId, tokenId, newLocation, cellEffects);
      }

      // カスタムフック
      const onPieceMove = param.onPieceMove;
      if (onPieceMove) {
        onPieceMove(state, roomManager, newLocation);
      }

      // 盤面全体を同期（すべての駒の状態を送る）
      io.to(roomId).emit('board:update', {
        boardId: boardId,
        board: state.boards[boardId],
        extraTokens: Object.values(state.boardTokens),
      } as BoardUpdateData);
    }
  });

  // 駒の移動可能範囲リクエスト
  socket.on(
    'board:movable-range',
    ({ roomId, boardId, playerId: tokenId, moveRange, isExact }: BoardMovableRangeData) => {
      const state = activeRooms.get(roomId);
      if (!state) return;
      const param = gameParams[state.gameId];
      const roomManager = new RoomManager(io, param, state);

      // 指定された tokenId の駒を取得
      const token = state.boardTokens[tokenId];
      if (!token || !token.position) return;

      const { row, col } = token.position;
      const startCellId = `r${row}c${col}`;

      // 移動範囲を計算
      const movableIds = roomManager.getMovableCellIds(boardId, startCellId, moveRange, isExact);

      // 位置情報形式に変換
      const movableLocs = movableIds.map((id) => {
        const m = id.match(/r(\d+)c(\d+)/);
        return {
          row: parseInt(m![1], 10),
          col: parseInt(m![2], 10),
        };
      });

      // 駒自体に移動可能範囲をセット（フロントがこれを参照する）
      token.movableCells = movableLocs;

      // 更新を通知
      io.to(roomId).emit('board:update', {
        boardId: boardId,
        board: state.boards[boardId],
        extraTokens: Object.values(state.boardTokens),
      } as BoardUpdateData);
    },
  );
}
