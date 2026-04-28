// src/components/Card/Card.tsx
import { CardData } from '@/types/card.js';
import { CardId } from '@/types/definition.js';
import React from 'react';
import cardStyles from './Card.module.css';
import { CardPreview } from './CardPreview.js';

export const CardDisplayContent = React.memo(
  ({ card, canSeeFront, size }: { card: CardData; canSeeFront: boolean; size: { width: number; height: number } }) => {
    // 裏向きの場合
    if (!canSeeFront) {
      return <div className={cardStyles.deckCard} style={{ backgroundColor: card.backColor || '#333' }} />;
    }

    // 表向き かつ 画像がある場合：背景色を指定しない
    if (card.frontImage) {
      return <img src={card.frontImage} alt={card.name} className={cardStyles.cardImage} />;
    }

    // 表向き かつ 画像がない場合：白背景のラッパーで名前を表示
    return (
      <div className={cardStyles.cardNameWrapper}>
        <strong className={cardStyles.cardNameText}>{card.name}</strong>
      </div>
    );
  },
);

type CardProps = {
  card: CardData;
  style?: React.CSSProperties;
  isActuallyFreeShape?: boolean;
  canSeeFront: boolean;
  onClick?: (id: CardId) => void;
  onPointerDown?: (e: React.PointerEvent) => void;
  onPointerUp?: (e: React.PointerEvent) => void;
  onDragStart?: React.DragEventHandler<HTMLDivElement>;
  isDraggable?: boolean;
  size: { width: number; height: number };
  showPreview?: boolean;
  onContextMenu?: (e: React.MouseEvent) => void;
};

export const Card = ({
  card,
  style,
  isActuallyFreeShape,
  canSeeFront,
  onClick,
  onPointerUp,
  onPointerDown,
  onDragStart,
  isDraggable,
  size,
  showPreview,
  onContextMenu,
}: CardProps) => {
  const [isDragging, setIsDragging] = React.useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick?.(card.id);
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    setIsDragging(true);
    onDragStart?.(e);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  return (
    <div
      className={`${isActuallyFreeShape ? '' : cardStyles.card} ${cardStyles.cardWrapper}`}
      style={style}
      onClick={handleClick}
      onPointerUp={onPointerUp}
      onPointerDown={onPointerDown}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      draggable={isDraggable}
      onContextMenu={onContextMenu}
    >
      <CardPreview card={card} size={size} disabled={!showPreview || isDragging}>
        <CardDisplayContent card={card} canSeeFront={canSeeFront} size={size} />
      </CardPreview>
    </div>
  );
};
