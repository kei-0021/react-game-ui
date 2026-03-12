import { PieceId } from '@/types/definition.js';
import type { DragEvent } from 'react';
import * as React from 'react';
import type { PieceData } from '../types/piece.js';
import { CellData } from './Cell.js';
type GridLocation = {
    row: number;
    col: number;
};
type GridBoardProps = {
    rows: number;
    cols: number;
    cellData: CellData[][];
    pieces: PieceData[];
    changedCells: GridLocation[];
    allowPieceDrag?: boolean;
    renderCell: (cellData: CellData, row: number, col: number) => React.ReactNode;
    onCellClick: (cellData: CellData, loc: GridLocation) => void;
    onCellDoubleClick: (cellData: CellData, loc: GridLocation) => void;
    onPieceClick: (pieceId: PieceId) => void;
    onPieceDragStart: (e: DragEvent<HTMLDivElement>, piece: PieceData) => void;
    onCellDrop: (e: React.DragEvent<HTMLDivElement>, row: number, col: number) => void;
};
/**
 * 盤面（グリッド）を表示し、セルや駒のインタラクション、ドラッグ＆ドロップを管理する
 * @param {number} rows - 盤面の行数
 * @param {number} cols - 盤面の列数
 * @param {CellData[][]} cellData - 各セルの状態を持つ2次元配列
 * @param {PieceData[]} pieces - 盤面上に配置される駒（Piece）のデータ
 * @param {GridLocation[]} changedCells - 状態変化（ハイライト等）を適用する座標のリスト
 * @param {boolean} [allowPieceDrag=false] - 駒のドラッグ操作を許可するかどうか
 * @param {(cellData: CellData, row: number, col: number) => React.ReactNode} renderCell - 各マスの内部コンテンツを描画する関数
 * @param {(cellData: CellData, loc: GridLocation) => void} onCellClick - セルがクリックされた時の処理
 * @param {(cellData: CellData, loc: GridLocation) => void} onCellDoubleClick - セルがダブルクリックされた時の処理
 * @param {(pieceId: string) => void} onPieceClick - 駒がクリックされた時の処理
 * @param {(e: DragEvent<HTMLDivElement>, piece: PieceData) => void} onPieceDragStart - 駒のドラッグが開始された時の処理
 * @param {(e: React.DragEvent<HTMLDivElement>, row: number, col: number) => void} onCellDrop - セルに要素がドロップされた時の処理
 */
export declare function GridBoard({ rows, cols, cellData, pieces, changedCells, renderCell, onCellClick, onCellDoubleClick, onPieceClick, allowPieceDrag, onPieceDragStart, onCellDrop, }: GridBoardProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=GridBoard.d.ts.map