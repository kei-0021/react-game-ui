import type { DragEvent } from 'react';
import * as React from 'react';
import type { PieceData } from '../types/piece.js';
import { CellData } from './Cell.js';
type GridLocation = {
    row: number;
    col: number;
};
type BoardProps = {
    rows: number;
    cols: number;
    boardData: CellData[][];
    pieces: PieceData[];
    changedCells: GridLocation[];
    allowPieceDrag?: boolean;
    renderCell: (cellData: CellData, row: number, col: number) => React.ReactNode;
    onCellClick: (cellData: CellData, loc: GridLocation) => void;
    onCellDoubleClick: (cellData: CellData, loc: GridLocation) => void;
    onPieceClick: (pieceId: string) => void;
    onPieceDragStart: (e: DragEvent<HTMLDivElement>, piece: PieceData) => void;
    onCellDrop: (e: React.DragEvent<HTMLDivElement>, row: number, col: number) => void;
};
export default function Board({ rows, cols, boardData, pieces, changedCells, renderCell, onCellClick, onCellDoubleClick, onPieceClick, allowPieceDrag, onPieceDragStart, onCellDrop }: BoardProps): import("react/jsx-runtime").JSX.Element;
export {};
