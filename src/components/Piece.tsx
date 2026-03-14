// src/components/Piece.tsx
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
  onDragEnd: (e: DragEvent<HTMLDivElement>, piece: PieceData) => void;
};

export function Piece({ piece, style, onClick, isDraggable, onDragStart, onDragEnd }: PieceProps): JSX.Element {
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
        // 画像がある場合は背景色を透明にするか、画像が丸く切り抜かれるように調整
        backgroundColor: piece.image ? 'transparent' : piece.color,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden', // 画像がはみ出さないように
      }}
      onClick={handleClick}
      draggable={isDraggable}
      onDragStart={handleDragStart}
      onDragEnd={(e) => onDragEnd(e, piece)}
    >
      {piece.image ? (
        <img
          src={piece.image}
          alt={piece.name}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            pointerEvents: 'none',
          }}
        />
      ) : (
        /* 画像がない場合は従来の文字表示 */
        piece.name.substring(0, 1)
      )}
    </div>
  );
}
