// src/components/CardPreview.tsx
import { Card } from '@/types/card.js';
import React, { useState } from 'react';
import { CardDisplayContent } from './Card.js';
import cardStyles from './Card.module.css';

type CardPreviewProps = {
  card: Card;
  children: React.ReactNode;
};

export const CardPreview = ({ card, children }: CardPreviewProps) => {
  const [isHovered, setIsHovered] = useState(false);

  // 表示する画像も説明もない場合は、ホバー機能を無効化してそのまま返す
  const hasPreview = !!card.frontImage || !!card.description;

  if (!hasPreview) {
    return <>{children}</>;
  }

  return (
    <div
      className={cardStyles.previewTrigger}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children}
      {isHovered && (
        <div className={cardStyles.previewOverlay}>
          <div className={cardStyles.previewContent}>
            <CardDisplayContent card={card} canSeeFront={true} />
            {card.description && <p className={cardStyles.previewDescription}>{card.description}</p>}
          </div>
        </div>
      )}
    </div>
  );
};
