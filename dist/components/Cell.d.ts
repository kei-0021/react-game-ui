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
    [key: string]: any;
};
type CellProps<TLocation> = {
    locationData: TLocation;
    cellData: CellData;
    changed: boolean;
    onClick: (loc: TLocation) => void;
    onDoubleClick: (loc: TLocation) => void;
    children: React.ReactNode;
    onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
    onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
};
/**
 * 盤面を構成する最小単位の「マス（セル）」をレンダリングし、イベントを管理する
 * @param {TLocation} locationData - このセルが保持する位置情報（ジェネリクス型）
 * @param {CellData} cellData - 背景色やコンテンツなどの描画用データ
 * @param {boolean} [changed=false] - 状態が変化している（ハイライト中）かどうか
 * @param {(loc: TLocation) => void} onClick - クリック時に位置情報を引数として実行されるコールバック
 * @param {(loc: TLocation) => void} onDoubleClick - ダブルクリック時に位置情報を実行するコールバック
 * @param {React.ReactNode} children - セル内に描画される要素（renderCellの結果など）
 * @param {(e: React.DragEvent<HTMLDivElement>) => void} onDrop - ドロップ操作時のハンドラ
 * @param {(e: React.DragEvent<HTMLDivElement>) => void} onDragOver - ドラッグ要素が重なった時のハンドラ
 */
export declare const Cell: <TLocation>({ locationData, cellData, onClick, onDoubleClick, children, onDrop, onDragOver, changed, }: React.PropsWithChildren<CellProps<TLocation>>) => import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=Cell.d.ts.map