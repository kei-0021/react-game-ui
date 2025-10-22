import * as React from 'react';
import type { PieceData } from '../types/piece.js';
import type { DragEvent } from 'react';
export type PieceProps = {
    piece: PieceData;
    style: React.CSSProperties;
    onClick: (pieceId: string) => void;
    isDraggable: boolean;
    onDragStart: (e: DragEvent<HTMLDivElement>, piece: PieceData) => void;
};
export default function Piece({ piece, style, onClick, isDraggable, onDragStart }: PieceProps): JSX.Element;
