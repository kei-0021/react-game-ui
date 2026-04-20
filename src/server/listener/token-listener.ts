// src/server/listner/token-lister.ts
import { GameParam, RoomState } from '@/index.js';
import { GameId, RoomId } from '@/types/definition.js';
import {
  TokenAcquireData,
  TokenMovableRangeData,
  TokenMoveFromBoardData,
  TokenMoveOnBoardData,
  TokenPlayData,
} from '@/types/socketData.js';
import { Server, Socket } from 'socket.io';
import { TokenManager } from '../logic/token-manager.js';
import { RoomManager } from '../room-manager.js';

export function registerTokenListeners(
  socket: Socket,
  io: Server,
  gameParams: Record<GameId, GameParam>,
  activeRooms: Map<RoomId, RoomState>,
) {
  // トークン置き場 → 手持ち
  socket.on('token:aquire', ({ roomId, tokenStoreId, tokenId }: TokenAcquireData) => {
    const state = activeRooms.get(roomId);
    if (!state) return;
    const param = gameParams[state.gameId];
    const roomManager = new RoomManager(io, param, state);

    const player = state?.players.find((p) => p.socketId === socket.id);
    if (state && player) {
      roomManager.acquireToken(tokenStoreId, tokenId, player.id);
      roomManager.emitPlayerUpdate();
    }
  });

  // 手持ち → 盤面
  socket.on('token:play', ({ roomId, boardId, tokenId, playerId, newPosition: newPosition }: TokenPlayData) => {
    const state = activeRooms.get(roomId);
    if (!state) return;
    const param = gameParams[state.gameId];
    const roomManager = new RoomManager(io, param, state);

    const tokenManager = new TokenManager(param, state);
    tokenManager.playToken(boardId, tokenId, playerId, newPosition);

    roomManager.emitPlayerUpdate();
    roomManager.emitBoardUpdate(boardId);
  });

  // 盤面 → 手持ち
  socket.on('token:move-from-board', ({ roomId, boardId, tokenId }: TokenMoveFromBoardData) => {
    const state = activeRooms.get(roomId);
    if (!state) return;
    const param = gameParams[state.gameId];
    const roomManager = new RoomManager(io, param, state);

    const tokenManager = new TokenManager(param, state);
    tokenManager.MoveFromBoardToken(boardId, tokenId, socket.id);

    // 更新を通知
    roomManager.emitPlayerUpdate();
    roomManager.emitBoardUpdate(boardId);
  });

  // 盤面 → 盤面
  socket.on('token:move-on-board', ({ roomId, boardId, tokenId, newPosition }: TokenMoveOnBoardData) => {
    const state = activeRooms.get(roomId);
    if (!state) return;
    const param = gameParams[state.gameId];
    const roomManager = new RoomManager(io, param, state);

    const tokenManager = new TokenManager(param, state);
    tokenManager.MoveOnBoardToken(boardId, tokenId, newPosition, roomManager);

    // 盤面全体を同期
    roomManager.emitBoardUpdate(boardId);
  });

  // 駒の移動可能範囲リクエスト
  socket.on('token:movable-range', ({ roomId, boardId, tokenId, moveRange, isExact }: TokenMovableRangeData) => {
    const state = activeRooms.get(roomId);
    if (!state) return;
    const param = gameParams[state.gameId];
    const roomManager = new RoomManager(io, param, state);

    const token = state.boardTokens[boardId].find((t) => t.id == tokenId);
    if (!token || !token.position) return;

    const { row, col } = token.position;
    const startCellId = `r${row}c${col}`;

    // 移動範囲を計算
    const movableIds = roomManager.getMovableCellIds(boardId, startCellId, moveRange, isExact);

    // 位置情報形式に変換
    const movableCells = movableIds.map((id) => {
      const m = id.match(/r(\d+)c(\d+)/);
      return {
        row: parseInt(m![1], 10),
        col: parseInt(m![2], 10),
      };
    });

    // 移動可能範囲をセット
    token.movableCells = movableCells;

    // 盤面全体を同期
    roomManager.emitBoardUpdate(boardId);
  });
}
