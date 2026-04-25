// src/components/Card/CardPreview.tsx
import { CardData } from '@/types/card.js';
import React, { useRef, useState } from 'react';
import { CardDisplayContent } from './Card.js';
import cardPreviewStyles from './CardPreview.module.css';

type CardPreviewProps = {
  card: CardData;
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
    <div className={cardPreviewStyles.previewTrigger} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      {children}
      {isHovered && (
        <div className={cardPreviewStyles.previewOverlay} style={{ top: `${position.y}px`, left: `${position.x}px` }}>
          <div className={cardPreviewStyles.previewContent}>
            <CardDisplayContent card={card} canSeeFront={true} />
            {card.description && <p className={cardPreviewStyles.previewDescription}>{card.description}</p>}
          </div>
        </div>
      )}
    </div>
  );
};
