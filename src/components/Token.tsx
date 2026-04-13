// src/components/Token.tsx
import { TokenData } from '@/types/token.js';
import type { DragEvent } from 'react';
import React from 'react';
import styles from './Token.module.css';

type TokenProps = {
  token: TokenData;
  onClick?: any;
  onDoubleClick?: any;
  onDragEnd?: (e: DragEvent<HTMLDivElement>, token: TokenData) => void;
};

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

export const Token = ({ token, onClick, onDoubleClick, onDragEnd }: TokenProps) => {
  const handleDragStart = (e: DragEvent<HTMLDivElement>) => {};

  return (
    <div
      className={styles.tokenContainer}
      onClick={(e) => onClick?.(e, token)}
      onDoubleClick={(e) => onDoubleClick?.(e, token)}
      draggable={true}
      onDragStart={handleDragStart}
      onDragEnd={(e) => onDragEnd?.(e, token)}
    >
      <TokenDisplayContent token={token} />
    </div>
  );
};
