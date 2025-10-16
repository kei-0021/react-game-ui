import type { DragEvent } from 'react';
import * as React from 'react';
import type { PieceData } from '../types/piece.js';
import type { CellId } from '../types/definition.js';
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
type Location = {
    row: number;
    col: number;
};
type BoardProps = {
    rows: number;
    cols: number;
    boardData: CellData[][];
    pieces: PieceData[];
    changedCells: Location[];
    allowPieceDrag?: boolean;
    renderCell: (cellData: CellData, row: number, col: number) => React.ReactNode;
    onCellClick: (cellData: CellData, row: number, col: number) => void;
    onCellDoubleClick: (cellData: CellData, row: number, col: number) => void;
    onPieceClick: (pieceId: string) => void;
    onPieceDragStart: (e: DragEvent<HTMLDivElement>, piece: PieceData) => void;
    onCellDrop: (e: React.DragEvent<HTMLDivElement>, row: number, col: number) => void;
};
export default function Board({ rows, cols, boardData, pieces, changedCells, renderCell, onCellClick, onCellDoubleClick, // ⭐ 追加
onPieceClick, allowPieceDrag, onPieceDragStart, onCellDrop }: BoardProps): import("react/jsx-runtime").JSX.Element;
export {};
