// src/server/listner/board-lister.ts
import { GameParam, RoomState } from '@/index.js';
import { GameId, RoomId } from '@/types/definition.js';
import { TokenMovableRangeData, TokenMoveOnBoardData } from '@/types/socketData.js';
import { Server, Socket } from 'socket.io';
import { RoomManager } from '../room-manager.js';

/**
 * ボード操作専用のイベントリスナーを登録する。
 * トークンの移動・移動可能範囲の計算を行うアクションを制御する。
 */
export function registerBoardListeners(
  socket: Socket,
  io: Server,
  gameParams: Record<GameId, GameParam>,
  activeRooms: Map<RoomId, RoomState>,
) {
  // トークンの移動
  socket.on('token:move-on-board', ({ roomId, boardId, tokenId, newLocation }: TokenMoveOnBoardData) => {
    const state = activeRooms.get(roomId);
    if (!state) return;
    const param = gameParams[state.gameId];
    const roomManager = new RoomManager(io, param, state);

    const token = state.boardTokens[tokenId];
    if (token) {
      // 座標を更新
      token.position = newLocation;

      // セル効果
      const cellEffects = param.cellEffects;
      if (cellEffects && token.ownerId) {
        roomManager.applyCellEffect(boardId, token.ownerId, newLocation, cellEffects);
      }

      // カスタムフック
      const onTokenMove = param.onTokenMove;
      if (onTokenMove) {
        onTokenMove(state, roomManager, newLocation);
      }

      // 盤面全体を同期
      roomManager.emitBoardUpdate(boardId);
    }
  });

  // 駒の移動可能範囲リクエスト
  socket.on(
    'token:movable-range',
    ({ roomId, boardId, playerId: tokenId, moveRange, isExact }: TokenMovableRangeData) => {
      const state = activeRooms.get(roomId);
      if (!state) return;
      const param = gameParams[state.gameId];
      const roomManager = new RoomManager(io, param, state);

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

      // 移動可能範囲をセット
      token.movableCells = movableLocs;

      // 盤面全体を同期
      roomManager.emitBoardUpdate(boardId);
    },
  );
}
