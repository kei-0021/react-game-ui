// src/types/cell.ts

import { CellId } from './definition.js';

/**
 * 各マスの基本データ構造
 * @property {CellId} id - セルの一意識別子
 * @property {string} shapeType - セルの形状（'rect', 'circle' 等）
 * @property {string} backgroundColor - 通常時の背景色
 * @property {string} changedColor - 状態変化時の背景色
 * @property {string} content - 通常時のコンテンツ
 * @property {string} changedContent - 状態変化時のコンテンツ
 * @property {string} adjacentCellIds: 隣接するセルID
 * @property {string} [customClip] - 特殊な形状を定義するクリップパス
 */
export type CellData = {
  id: CellId;
  shapeType: string;
  backgroundColor: string;
  changedColor: string;
  content: string;
  changedContent: string;
  customClip?: string;
  adjacentCellIds: CellId[];
  [key: string]: any;
};
