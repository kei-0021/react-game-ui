import type { Coordinate } from './coodinate.js';
import type { DraggableId } from './definition.js';
/**
 * 盤面上に自由に配置されるオブジェクト（コマ、トークンなど）のデータ構造
 */
export type DraggableData = {
    id: DraggableId;
    coordinate: Coordinate;
    zIndex: number;
    rotation: number;
};
//# sourceMappingURL=draggable.d.ts.map