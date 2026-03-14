import type { DragEvent } from 'react';
import * as React from 'react';
import type { PieceData } from '../types/piece.js';
export type PieceProps = {
    piece: PieceData;
    style: React.CSSProperties;
    onClick: (pieceId: string) => void;
    isDraggable: boolean;
    onDragStart: (e: DragEvent<HTMLDivElement>, piece: PieceData) => void;
    onDragEnd: (e: DragEvent<HTMLDivElement>, piece: PieceData) => void;
};
export declare function Piece({ piece, style, onClick, isDraggable, onDragStart, onDragEnd }: PieceProps): JSX.Element;
//# sourceMappingURL=Piece.d.ts.map