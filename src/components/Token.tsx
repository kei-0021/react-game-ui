// src/components/Token.tsx
import { TokenData } from '@/types/token.js';
import type { DragEvent } from 'react';
import React from 'react';
import styles from './Token.module.css';

const TokenDisplayContent = React.memo(({ token }: { token: TokenData }) => {
  // 画像がある場合
  if (token.image) {
    return (
      <div className={styles.contentWrapper} style={{ backgroundColor: token.color || '#4f4848ff' }}>
        <img src={token.image} alt={token.name} className={styles.image} />
      </div>
    );
  }

  // 画像がない場合
  return (
    <div className={styles.contentWrapper} style={{ backgroundColor: token.color || '#4f4848ff' }}>
      <div className={styles.textWrapper}>
        <strong className={styles.text}>{token.name}</strong>
      </div>
    </div>
  );
});

type TokenProps = {
  token: TokenData;
  style?: React.CSSProperties;
  onClick?: any;
  onDoubleClick?: any;
  isDraggable?: boolean;
  onDragStart?: any;
  onDragEnd?: (e: DragEvent<HTMLDivElement>, token: TokenData) => void;
};

export const Token = ({ token, style, onClick, onDoubleClick, isDraggable, onDragStart, onDragEnd }: TokenProps) => {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick(token.id);
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDoubleClick(token.id);
  };

  const handleDragStart = (e: DragEvent<HTMLDivElement>) => {
    if (isDraggable) {
      e.stopPropagation();
      e.dataTransfer.setData('pieceId', token.id);
      e.dataTransfer.effectAllowed = 'move';

      if (token.image) {
        e.dataTransfer.setDragImage(e.currentTarget, 45, 45);
      }

      onDragStart?.(e, token);
    }
  };

  const handleDragEnd = (e: DragEvent<HTMLDivElement>) => {
    onDragEnd?.(e, token);
  };

  return (
    <div
      className={styles.tokenContainer}
      style={{
        ...style,
      }}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      draggable={true}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <TokenDisplayContent token={token} />
    </div>
  );
};
