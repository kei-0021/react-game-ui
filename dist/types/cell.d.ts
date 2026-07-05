import type { CellId } from './definition.js';
/**
 * 各マスの基本データ構造
 * @property {CellId} id - セルの一意識別子
 * @property {string} name - セルの名前
 * @property {string} shapeType - セルの形状（'rect', 'circle' 等）
 * @property {string} backgroundColor - 通常時の背景色
 * @property {string} changedColor - 状態変化時の背景色
 * @property {string} content - 通常時のコンテンツ
 * @property {string} changedContent - 状態変化時のコンテンツ
 * @property {string} [customClip] - 特殊な形状を定義するクリップパス
 * @property {string} adjacentCellIds: 隣接するセルID
 */
export type CellData = {
    id: CellId;
    name: string;
    shapeType: string;
    backgroundColor: string;
    changedColor: string;
    content: string;
    changedContent: string;
    customClip?: string;
    adjacentCellIds: CellId[];
};
//# sourceMappingURL=cell.d.ts.map