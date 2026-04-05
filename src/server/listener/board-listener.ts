// src/server/listner/board-lister.ts
import { GameId, RoomId } from '@/types/definition.js';
import { GameParam, RoomState } from '@/types/server.js';
import { BaordMovePlayerData, BoardMovableRangeData } from '@/types/socketData.js';
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
  socket.on('board:move-player', ({ roomId, boardId, playerId, newLocation }: BaordMovePlayerData) => {
    const state = activeRooms.get(roomId);
    if (!state) return;
    const param = gameParams[state.gameId];
    const roomManager = new RoomManager(io, param, state);

    const player = state?.players.find((p) => p.id === playerId);
    if (player && state) {
      player.position = newLocation;

      // セル効果
      const cellEffects = param.cellEffects;
      if (cellEffects) {
        roomManager.applyCellEffect(boardId, playerId, newLocation, cellEffects);
      }

      // カスタムフック
      const onPieceMove = param.onPieceMove;
      if (onPieceMove) {
        onPieceMove(state, roomManager, newLocation);
      }

      roomManager.emitPlayerUpdate();
    }
  });

  // プレイヤーの移動可能範囲リクエストを処理する
  socket.on('board:movable-range', ({ roomId, boardId, playerId, moveRange, isExact }: BoardMovableRangeData) => {
    const state = activeRooms.get(roomId);
    if (!state) return;
    const param = gameParams[state.gameId];
    const roomManager = new RoomManager(io, param, state);

    // プレイヤーの現在位置を取得
    const player = state.players.find((p) => p.id === playerId);
    if (!player) return;

    const { row, col } = player.position;
    const startCellId = `r${row}c${col}`;

    // 移動範囲を計算
    const movableIds = roomManager.getMovableCellIds(boardId, startCellId, moveRange, isExact);

    // セルIDをクライアントが解釈できる GridLocation[] 形式に変換
    const movableLocs = movableIds.map((id) => {
      const m = id.match(/r(\d+)c(\d+)/);
      return {
        row: parseInt(m![1], 10),
        col: parseInt(m![2], 10),
      };
    });
    player.movableCells = movableLocs;

    roomManager.emitPlayerUpdate();
  });
}
