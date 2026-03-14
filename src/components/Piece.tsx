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
      e.dataTransfer.setData('pieceId', piece.id);
      e.dataTransfer.effectAllowed = 'move';
      onDragStart(e, piece);
    }
  };

  const pieceClasses = [styles.piece, isDraggable ? styles.draggable : styles.clickable].join(' ');

  const imageStyle: React.CSSProperties = piece.image
    ? {
        WebkitMaskImage: `url("${piece.image}")`,
        maskImage: `url("${piece.image}")`,
        WebkitMaskSize: 'contain',
        maskSize: 'contain',
        WebkitMaskRepeat: 'no-repeat',
        maskRepeat: 'no-repeat',
        WebkitMaskPosition: 'center',
        maskPosition: 'center',
        backgroundColor: 'transparent',
        borderRadius: '0',
        filter: `drop-shadow(1px 0 0 ${piece.color}) drop-shadow(-1px 0 0 ${piece.color}) drop-shadow(0 1px 0 ${piece.color}) drop-shadow(0 -1px 0 ${piece.color})`,
      }
    : {
        backgroundColor: piece.color,
      };

  return (
    <div
      className={pieceClasses}
      style={{
        ...style,
        ...imageStyle,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      onClick={handleClick}
      draggable={isDraggable}
      onDragStart={handleDragStart}
      onDragEnd={(e) => onDragEnd(e, piece)}
    >
      {piece.image ? (
        <img
          src={piece.image}
          alt=""
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            pointerEvents: 'none',
          }}
        />
      ) : (
        piece.name.substring(0, 1)
      )}
    </div>
  );
}
