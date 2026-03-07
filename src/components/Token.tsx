// src/components/Token.tsx
import { Token } from '@/types/token.js';
import React from 'react';
import styles from './Token.module.css';

export const TokenDisplayContent = React.memo(({ token }: { token: Token }) => {
  if (token.imageSrc) {
    return (
      <div className={styles.contentWrapper}>
        <img src={token.imageSrc} alt={token.name} className={styles.image} />;
      </div>
    );
  }

  return (
    <div className={styles.contentWrapper}>
      <div className={styles.textWrapper}>
        <strong className={styles.text}>{token.name}</strong>
      </div>
    </div>
  );
});
