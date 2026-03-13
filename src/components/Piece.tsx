import type { DragEvent } from 'react';
import * as React from 'react';
import type { PieceData } from '../types/piece.js';
import styles from './Piece.module.css';

export type PieceProps = {
  piece: PieceData;
  style: React.CSSProperties;
  onClick: (pieceId: string) => void;
  isDraggable: boolean;
  onDragStart: (e: DragEvent<HTMLDivElement>, piece: PieceData) => void;
};
// 戻り値の型も明示
export function Piece({ piece, style, onClick, isDraggable, onDragStart }: PieceProps): JSX.Element {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick(piece.id);
  };

  const handleDragStart = (e: DragEvent<HTMLDivElement>) => {
    if (isDraggable) {
      e.stopPropagation();

      e.dataTransfer.setData('text/plain', piece.id);
      e.dataTransfer.effectAllowed = 'move';

      onDragStart(e, piece);
    }
  };

  const pieceClasses = [styles.piece, isDraggable ? styles.draggable : styles.clickable].join(' ');

  return (
    <div
      className={pieceClasses}
      style={{
        ...style,
        backgroundColor: piece.color,
      }}
      onClick={handleClick}
      draggable={isDraggable}
      onDragStart={handleDragStart}
    >
      {/* コマの中に表示する文字やアイコン */}
      {piece.name.substring(0, 1)}
    </div>
  );
}
