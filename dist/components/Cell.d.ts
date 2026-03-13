import * as React from 'react';
import type { CellId } from '../types/definition.js';
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
type CellProps<TLocation> = {
    locationData: TLocation;
    cellData: CellData;
    highlighted?: boolean;
    changed: boolean;
    onClick: (loc: TLocation) => void;
    onDoubleClick: (loc: TLocation) => void;
    children: React.ReactNode;
    onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
    onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
};
/**
 * 盤面を構成する最小単位の「マス（セル）」をレンダリングし、イベントを管理する
 * @template TLocation 位置情報の型定義
 * @param {TLocation} locationData - このセルが保持する位置情報
 * @param {CellData} cellData - 背景色やコンテンツなどの描画用データ
 * @param {boolean} [highlighted=false] - 移動可能範囲として強調表示するかどうか
 * @param {boolean} [changed=false] - 探索済みなどの状態変化（コンテンツの切り替え）を適用するかどうか
 * @param {(loc: TLocation) => void} onClick - クリック時に実行されるコールバック
 * @param {(loc: TLocation) => void} onDoubleClick - ダブルクリック時に実行されるコールバック
 * @param {React.ReactNode} children - セル内に描画される要素
 * @param {(e: React.DragEvent<HTMLDivElement>) => void} onDrop - ドロップ操作時のハンドラ
 * @param {(e: React.DragEvent<HTMLDivElement>) => void} onDragOver - ドラッグ要素が重なった時のハンドラ
 */
export declare const Cell: <TLocation>({ locationData, cellData, onClick, onDoubleClick, children, onDrop, onDragOver, highlighted, changed, }: React.PropsWithChildren<CellProps<TLocation>>) => import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=Cell.d.ts.map