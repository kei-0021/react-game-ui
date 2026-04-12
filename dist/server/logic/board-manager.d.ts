import { BoardId, CellId } from '@/types/definition.js';
import { Position } from '@/types/position.js';
import { RoomState } from '@/types/roomState.js';
export declare const isExplored: (roomState: RoomState, position: Position) => boolean;
export declare class BoardManager {
    private state;
    constructor(state: RoomState);
    /**
     * 指定したセルから一定歩数で行けるセルIDをすべて取得する
     * isExact: true の場合、moveRange と同じ歩数のセルのみを返す
     */
    getMovableCellIds: (boardId: BoardId, startCellId: CellId, moveRange: number, isExact: boolean) => CellId[];
    /**
     * 特定のセルの探索状態を切り替える
     * @param {Position} position - 操作対象の座標
     * @param {boolean} shouldMark - 探索済みにする場合は true、解除する場合は false
     * @returns {boolean} 状態が実際に変化した場合は true
     */
    updateCellExploredStatus: (position: Position, shouldMark: boolean) => void;
}
//# sourceMappingURL=board-manager.d.ts.map