// src/server/logic/board-manager.ts
import { BoardId, CellId } from '@/types/definition.js';
import { Position } from '@/types/position.js';
import { RoomState } from '@/types/roomState.js';
import { server_log } from '../log/logger.js';

export const isExplored = (roomState: RoomState, position: Position): boolean => {
  return roomState.exploredCells.some((loc) => loc.row === position.row && loc.col === position.col);
};

export class BoardManager {
  constructor(private state: RoomState) {}

  /**
   * 指定したセルから一定歩数で行けるセルIDをすべて取得する
   * isExact: true の場合、moveRange と同じ歩数のセルのみを返す
   */
  getMovableCellIds = (boardId: BoardId, startCellId: CellId, moveRange: number, isExact: boolean): CellId[] => {
    const targetBoard = this.state.boards[boardId];
    const boardMap = new Map(targetBoard.map((c) => [c.id, c]));

    const reachable = new Set<string>();
    const queue: { id: string; dist: number }[] = [{ id: startCellId, dist: 0 }];
    const visited = new Set<string>([startCellId]);

    while (queue.length > 0) {
      const { id, dist } = queue.shift()!;

      // 登録条件の判定
      if (dist > 0) {
        if (isExact) {
          // isExactフラグがtrueなら、指定歩数と同じ場合のみ登録
          if (dist === moveRange) reachable.add(id);
        } else {
          // 通常時は今まで通り移動範囲内すべて
          reachable.add(id);
        }
      }

      // 探索継続の判定（移動範囲を超えたら隣接は探さない）
      if (dist >= moveRange) continue;

      const cell = boardMap.get(id);
      cell?.adjacentCellIds.forEach((nextId) => {
        if (!visited.has(nextId)) {
          visited.add(nextId);
          queue.push({ id: nextId, dist: dist + 1 });
        }
      });
    }
    return Array.from(reachable);
  };

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
