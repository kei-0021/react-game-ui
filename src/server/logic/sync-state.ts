import { RoomState } from '@/types/server.js';
import { BoardUpdateData, GameTurnUpdateData } from '@/types/socketData.js';
import { Server } from 'socket.io';
import { RoomManager } from '../server-utils.js';

/**
 * 準備のできたプレイヤーに対してルームの状態を配信する
 * @param state - 初期化済みのルームの状態
 * @param roomManager - 状態更新を扱うクラス
 * @param io - 通信を制御するSocket.IOサーバーインスタンス
 */
export function syncState(state: RoomState, roomManager: RoomManager, io: Server): void {
  // 全ての初期同期をここで実行
  const lastMessage = state.systemMessageHistory.at(-1);
  if (lastMessage) roomManager.emitSystemMessage(lastMessage, 0, true);

  // プレイヤー, デッキ, トークン置き場, ボード, ドラッグ可能オブジェクト の初期状態を配信
  roomManager.emitPlayerUpdate();
  Object.keys(state.decks).forEach((id) => roomManager.emitDeckUpdate(id));
  Object.keys(state.tokenStores).forEach((id) => roomManager.emitTokenStoreUpdate(id));
  if (state.exploredCells.length > 0) io.to(state.roomId).emit('cell:update', state.exploredCells);
  Object.entries(state.boards).forEach(([boardId, board]) => {
    io.to(state.roomId).emit('board:update', { boardId, board } as BoardUpdateData);
  });
  Object.keys(state.draggables).forEach((id) => roomManager.emitDraggableUpdate(id));

  // 初回の一人のみターンを更新する
  if (state.players.length == 1) {
    roomManager.updateRound();
  } else {
    io.to(state.roomId).emit('game:turn', {
      currentPlayerId: state.players[state.currentTurnIndex % state.players.length].id,
      currentRoundIndex: state.currentRoundIndex,
      currentTurnIndex: state.currentTurnIndex,
    } as GameTurnUpdateData);
  }
}
