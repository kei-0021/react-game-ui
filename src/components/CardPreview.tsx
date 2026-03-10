// src/components/CardPreview.tsx
import { Card } from '@/types/card.js';
import React, { useRef, useState } from 'react';
import { CardDisplayContent } from './Card.js';
import cardStyles from './Card.module.css';

type CardPreviewProps = {
  card: Card;
  children: React.ReactNode;
};

export const CardPreview = ({ card, children }: CardPreviewProps) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const hasPreview = !!card.frontImage || !!card.description;

  // プレビューの表示はカーソル侵入から0.5秒待つ
  const handleMouseEnter = (e: React.MouseEvent) => {
    timerRef.current = setTimeout(() => {
      setPosition({ x: e.clientX, y: e.clientY - 180 });
      setIsHovered(true);
    }, 500);
  };

  const handleMouseLeave = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    setIsHovered(false);
  };

  if (!hasPreview) {
    return <>{children}</>;
  }

  return (
    <div className={cardStyles.previewTrigger} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      {children}
      {isHovered && (
        <div className={cardStyles.previewOverlay} style={{ top: `${position.y}px`, left: `${position.x}px` }}>
          <div className={cardStyles.previewContent}>
            <CardDisplayContent card={card} canSeeFront={true} />
            {card.description && <p className={cardStyles.previewDescription}>{card.description}</p>}
          </div>
        </div>
      )}
    </div>
  );
};
