// src/server/logic/board-manager.ts
import { Position } from '@/types/position.js';
import { RoomState } from '@/types/roomState.js';
import { server_log } from '../log/logger.js';

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
}
