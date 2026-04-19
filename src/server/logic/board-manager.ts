// src/server/logic/board-manager.ts
import { BoardId, PlayerId } from '@/types/definition.js';
import { Position } from '@/types/position.js';
import { RoomState } from '@/types/roomState.js';
import { server_log } from '../log/logger.js';
import type { RoomManager } from '../room-manager.js';

export const isExplored = (roomState: RoomState, position: Position): boolean => {
  return roomState.exploredCells.some((loc) => loc.row === position.row && loc.col === position.col);
};

export class BoardManager {
  constructor(private state: RoomState) {}

  /**
   * 特定のセルの探索状態を切り替える
   * @param {Position} position - 操作対象の座標
   * @param {boolean} shouldMark - 探索済みにする場合は true、解除する場合は false
   * @returns {boolean} 状態が実際に変化した場合は true
   */
  updateCellExploredStatus = (position: Position, shouldMark: boolean) => {
    const isCurrentlyExplored = isExplored(this.state, position);

    if (shouldMark && !isCurrentlyExplored) {
      this.state.exploredCells.push(position);
      server_log(
        'cell',
        this.state.gameId,
        this.state.roomId,
        `マス (${position.row}, ${position.col}) を探索済みとしてマークしました。`,
      );
    }

    if (!shouldMark && isCurrentlyExplored) {
      this.state.exploredCells = this.state.exploredCells.filter(
        (loc) => !(loc.row === position.row && loc.col === position.col),
      );
      server_log(
        'cell',
        this.state.gameId,
        this.state.roomId,
        `マス (${position.row}, ${position.col}) の探索済みマークを解除しました。`,
      );
    }
  };

  /**
   * セル効果を発動する
   */
  applyCellEffect = (
    boardId: BoardId,
    playerId: PlayerId,
    position: Position,
    cellEffects: Record<string, (manager: RoomManager, playerId: PlayerId) => void>,
    roomManager: RoomManager,
  ): void => {
    // ボード情報を取得
    const { row, col } = position;
    const targetBoard = this.state.boards[boardId];

    if (!targetBoard) {
      server_log('warn', this.state.gameId, this.state.roomId, 'applyCellEffect: ボードがありません。');
      return;
    }

    // ID（座標形式）で対象のセルを検索
    const targetId = `r${row}c${col}`;
    const cell = targetBoard.find((c) => c.id === targetId);

    // セルが見つからない場合のガード
    if (!cell) {
      server_log(
        'warn',
        this.state.gameId,
        this.state.roomId,
        `applyCellEffect: 指定座標にセルが見つかりません。ID: ${targetId}`,
      );
      return;
    }

    const effect = cellEffects[cell.name];

    if (effect) {
      server_log('cell', this.state.gameId, this.state.roomId, `マス効果発動: ${cell.name} by ${playerId}`);
      try {
        effect(roomManager, playerId);
      } catch (e) {
        server_log(
          'warn',
          this.state.gameId,
          this.state.roomId,
          `マス効果の実行中にエラーが発生しました: ${cell.name}`,
        );
      }
    } else {
      server_log('cell', this.state.gameId, this.state.roomId, `マス効果なし: (${row}, ${col}) ${cell.name}`);
    }
  };
}
