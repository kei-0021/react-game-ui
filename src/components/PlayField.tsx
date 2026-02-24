// src/components/PlayField.tsx

import { CardMoveFromFieldData } from '@/types/socketData.js';
import * as React from 'react';
import { Socket } from 'socket.io-client';
import type { Card } from '../types/card.js';
import type { DeckId, PlayerId, RoomId } from '../types/definition.js';
import type { PlayerWithResources } from '../types/playerWithResources.js';
import { client_log } from '../utils/client-log.js';
import styles from './Card.module.css';
import './PlayField.css';

// 通信量制限用の throttle
function throttle<T extends (...args: any[]) => any>(func: T, limit: number) {
  let inThrottle: boolean;
  return function (this: any, ...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

const CardDisplayContent = ({ card, isFaceUp }: { card: Card; isFaceUp: boolean }) => {
  if (!isFaceUp) {
    return null;
  }

  if (card.frontImage) {
    return <img src={card.frontImage} alt={card.name} className="rg-card-image" />;
  }

  return (
    <div className="rg-card-text-content">
      <strong className="rg-card-name-label">{card.name}</strong>
    </div>
  );
};

type PlayFieldProps = {
  socket: Socket;
  roomId: RoomId;
  deckId: DeckId;
  title?: string;
  players: PlayerWithResources[];
  myPlayerId: PlayerId | null;
  layoutMode?: 'grid' | 'free';
  is_logging?: boolean;
  backgroundImage?: string;
};

export function PlayField({
  socket,
  roomId,
  deckId,
  title,
  players,
  myPlayerId,
  layoutMode = 'free',
  is_logging = false,
  backgroundImage,
}: PlayFieldProps) {
  const [playedCards, setPlayedCards] = React.useState<Card[]>([]);
  const [activeDraggingId, setActiveDraggingId] = React.useState<string | null>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const draggingIdRef = React.useRef<string | null>(null);

  React.useEffect(() => {
    const handleUpdate = (data: { playFieldCards?: Card[] }) => {
      const newCards = data.playFieldCards || [];
      if (is_logging) {
        client_log('playField', `[${deckId}] 場の更新: ${newCards.length}枚`);
      }
      setPlayedCards(newCards);
    };

    socket.on(`deck:update:${roomId}:${deckId}`, handleUpdate);
    return () => {
      socket.off(`deck:update:${roomId}:${deckId}`, handleUpdate);
    };
  }, [socket, roomId, deckId, is_logging]);

  // リアルタイム送信ロジック（境界制限付き）
  const emitMove = React.useMemo(
    () =>
      throttle((cardId: string, clientX: number, clientY: number) => {
        if (!containerRef.current) return;

        const rect = containerRef.current.getBoundingClientRect();

        // 座標計算 & 0-100% の範囲にクランプ
        let x = ((clientX - rect.left) / rect.width) * 100;
        let y = ((clientY - rect.top) / rect.height) * 100;

        x = Math.max(0, Math.min(100, x));
        y = Math.max(0, Math.min(100, y));

        socket.emit('card:move-on-field', {
          roomId,
          deckId,
          cardId,
          coordinate: { x, y },
        });
      }, 50),
    [socket, roomId, deckId],
  );

  const handlePointerDown = (e: React.PointerEvent, card: Card) => {
    if (layoutMode !== 'free') return;
    draggingIdRef.current = card.id;
    setActiveDraggingId(card.id);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!draggingIdRef.current) return;
    emitMove(draggingIdRef.current, e.clientX, e.clientY);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!draggingIdRef.current) return;
    emitMove(draggingIdRef.current, e.clientX, e.clientY);
    (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    draggingIdRef.current = null;
    setActiveDraggingId(null);
  };

  // --- 手札（ScoreBoard）からの新規ドロップ受け入れ ---
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!containerRef.current || !myPlayerId) return;

    const droppedCardId = e.dataTransfer.getData('cardId');
    const droppedDeckId = e.dataTransfer.getData('deckId');
    if (!droppedCardId || !droppedDeckId) return;

    const rect = containerRef.current.getBoundingClientRect();

    let x = ((e.clientX - rect.left) / rect.width) * 100;
    let y = ((e.clientY - rect.top) / rect.height) * 100;

    x = Math.max(0, Math.min(100, x));
    y = Math.max(0, Math.min(100, y));

    // サーバーへ「この場所にプレイする」と送信
    socket.emit('card:play', {
      roomId,
      deckId: droppedDeckId,
      cardIds: [droppedCardId],
      playerId: myPlayerId,
      // サーバー側の strict な if 文に合わせて "field" 固定で送る
      playLocation: 'field',
      coordinate: { x, y },
    });

    if (is_logging) {
      client_log('playField', `Card ${droppedCardId} dropped at x:${x.toFixed(1)}%, y:${y.toFixed(1)}%`);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    // ドロップを有効にするために必須
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleCardBack = (card: Card) => {
    const backTo = card.fieldBackLocation || 'discard';
    const requestData: CardMoveFromFieldData = {
      roomId,
      deckId: card.deckId || deckId,
      cardId: card.id,
    };

    if (backTo === 'hand') {
      if (!card.ownerId) return;
      requestData.targetPlayerId = card.ownerId;
    }

    socket.emit('card:move-from-field', requestData);
  };

  return (
    <section
      className={`rg-playfield mode-${layoutMode}`}
      style={{
        background: backgroundImage ? `url(${backgroundImage}) center/cover no-repeat` : undefined,
      }}
    >
      <h3 className="rg-playfield-title">
        {title !== undefined && title !== null ? title : `プレイフィールド (deckId=${deckId})`}
      </h3>{' '}
      <div
        ref={containerRef}
        className="rg-playfield-container"
        onPointerMove={handlePointerMove}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        style={{
          position: 'relative',
          minHeight: '600px',
          touchAction: 'none',
          overflow: 'visible',
        }}
      >
        {playedCards.map((card, index) => {
          const owner = players.find((p) => p.id === card.ownerId);
          const isDragging = activeDraggingId === card.id;

          // 画像がないのに freeShape が true になっている事故を防ぐための判定
          const isActuallyFreeShape = !!(card.freeShape && card.frontImage);

          const isOverlapping = playedCards
            .slice(0, index)
            .some(
              (other) =>
                Math.abs((other.coordinate?.x ?? 50) - (card.coordinate?.x ?? 50)) < 1 &&
                Math.abs((other.coordinate?.y ?? 50) - (card.coordinate?.y ?? 50)) < 1,
            );
          const visualOffset = isOverlapping ? index * 12 : 0;

          const freeStyle: React.CSSProperties =
            layoutMode === 'free'
              ? {
                  position: 'absolute',
                  left: `${card.coordinate?.x ?? 50}%`,
                  top: `${card.coordinate?.y ?? 50}%`,
                  transform: `translate(calc(-50% + ${visualOffset}px), calc(-50% + ${visualOffset}px))`,
                  // ドラッグ中は 4、静止中は 2 前後になるよう調整
                  // タイトル(1) < カード(2) < ドラッグ中(4) < 一般的なポップアップ(10〜)
                  zIndex: isDragging ? 4 : 2,
                }
              : {};

          return (
            <div
              key={card.id}
              onPointerDown={(e) => handlePointerDown(e, card)}
              onPointerUp={handlePointerUp}
              className={`${isActuallyFreeShape ? '' : styles.card} rg-playfield-card-wrapper`}
              style={
                {
                  '--owner-color': owner?.color || '#aaaaaa',
                  ...freeStyle,
                  touchAction: 'none',
                  cursor: isDragging ? 'grabbing' : layoutMode === 'free' ? 'grab' : 'default',
                  // サイズを固定して安定させる
                  width: '80px',
                  height: '112px',
                  ...(isActuallyFreeShape
                    ? {
                        background: 'transparent',
                        border: 'none',
                        boxShadow: 'none',
                        padding: 0,
                      }
                    : {}),
                } as React.CSSProperties
              }
              onDoubleClick={() => handleCardBack(card)}
            >
              <CardDisplayContent card={card} isFaceUp={true} />

              {card.ownerId && (
                <div className="rg-playfield-owner-badge" title={`所有者: ${owner?.name || '不明'}`}>
                  {owner?.name?.[0] || '?'}
                </div>
              )}

              {card.description && !isDragging && <span className={styles.tooltip}>{card.description}</span>}
            </div>
          );
        })}
      </div>
    </section>
  );
}
