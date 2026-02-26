// src/components/Card.tsx
import { Card } from '@/types/card.js';
import React from 'react';
import cardStyles from './Card.module.css';

export const CardDisplayContent = React.memo(({ card, canSeeFront }: { card: Card; canSeeFront: boolean }) => {
  // 裏向きの場合
  if (!canSeeFront) {
    return (
      <div
        className={cardStyles.deckCard}
        style={{
          backgroundColor: card.backColor || '#333',
        }}
      />
    );
  }

  // 表向き かつ 画像がある場合
  if (card.frontImage) {
    return <img src={card.frontImage} alt={card.name} className={cardStyles.cardImage} style={{}} />;
  }

  // 表向き かつ 画像がない場合、名前を表示
  return (
    <div className={cardStyles.cardNameWrapper} style={{}}>
      <strong className={cardStyles.cardNameText}>{card.name}</strong>
    </div>
  );
});
