// src/components/Card/CardPreview.tsx
import { CardData } from '@/types/card.js';
import React, { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { CardDisplayContent } from './Card.js';
import cardPreviewStyles from './CardPreview.module.css';

type CardPreviewProps = {
  card: CardData;
  children: React.ReactNode;
  disabled?: boolean;
};

export const CardPreview = ({ card, children, disabled }: CardPreviewProps) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const hasPreview = !!card.frontImage || !!card.description;

  // プレビューの表示はカーソル侵入から0.75秒待つ
  const handleMouseEnter = (e: React.MouseEvent) => {
    if (disabled) return;

    const { clientX, clientY } = e;

    timerRef.current = setTimeout(() => {
      setIsHovered(true);
      setPosition({ x: clientX, y: clientY });
    }, 750);
  };

  const handleMouseLeave = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    setIsHovered(false);
  };

  // ドラッグ開始（disabledに変化）した瞬間に表示を消す
  if (disabled && isHovered) {
    handleMouseLeave();
  }

  if (!hasPreview) {
    return <>{children}</>;
  }

  return (
    <div
      className={cardPreviewStyles.previewTrigger}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onPointerDown={handleMouseLeave}
    >
      {children}
      {isHovered &&
        !disabled &&
        createPortal(
          <div
            className={cardPreviewStyles.previewOverlay}
            style={{ top: `${position.y - 200}px`, left: `${position.x}px` }}
          >
            <div className={cardPreviewStyles.previewContent}>
              <CardDisplayContent card={card} canSeeFront={true} />
              {card.description && <p className={cardPreviewStyles.previewDescription}>{card.description}</p>}
            </div>
          </div>,
          document.getElementById('portal-root')!,
        )}
    </div>
  );
};
