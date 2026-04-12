// src/components/Token.tsx
import { TokenData } from '@/types/token.js';
import React from 'react';
import styles from './Token.module.css';

export const TokenDisplayContent = React.memo(({ token }: { token: TokenData }) => {
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
