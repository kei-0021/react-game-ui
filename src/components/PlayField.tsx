// src/components/PlayField.tsx

import { Player } from '@/types/player.js';
import { CardMoveFromFieldData, CardPlayData, DeckUpdateData } from '@/types/socketData.js';
import * as React from 'react';
import { Socket } from 'socket.io-client';
import type { Card } from '../types/card.js';
import type { DeckId, PlayerId, RoomId } from '../types/definition.js';
import { CardDisplayContent } from './Card.js';
import cardStyles from './Card.module.css';
import playFieldStyles from './PlayField.module.css';

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

type PlayFieldProps = {
  socket: Socket;
  roomId: RoomId;
  deckId: DeckId;
  title?: string;
  players: Player[];
  myPlayerId: PlayerId | null;
  layoutMode?: 'grid' | 'free';
  backgroundImage?: string;
  baseZIndex?: number;
  is_logging?: boolean;
};

/**
 * カードを自由配置（Free Mode）またはグリッド配置し、移動やドロップ操作を管理する
 * @param {Socket} socket - Socket.ioのインスタンス
 * @param {RoomId} roomId - 現在のルームID
 * @param {DeckId} deckId - このフィールドが紐付いているデッキのID
 * @param {string} [title] - フィールドの表示タイトル
 * @param {Player[]} players - ルームに参加しているプレイヤー情報（オーナー表示用）
 * @param {PlayerId | null} myPlayerId - ローカルプレイヤーのID
 * @param {'grid' | 'free'} [layoutMode='free'] - カードの配置モード（自由配置またはグリッド）
 * @param {string} [backgroundImage] - フィールドの背景画像URL
 * @param {string} [baseZIndex] - カードの重ね順
 * @param {boolean} [is_logging=false] - デバッグログを出力するかどうか
 */
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
  baseZIndex = 100,
}: PlayFieldProps) {
  const [playedCards, setPlayedCards] = React.useState<Card[]>([]);
  const [activeDraggingId, setActiveDraggingId] = React.useState<string | null>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const draggingIdRef = React.useRef<string | null>(null);

  React.useEffect(() => {
    socket.on(`deck:update:${deckId}`, (data: DeckUpdateData) => {
      const newCards = data.playFieldCards || [];
      setPlayedCards(newCards);
    });

    return () => {
      socket.off(`deck:update:${deckId}`);
    };
  }, [socket, roomId, deckId]);

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

    const playData: CardPlayData = {
      roomId,
      deckId: droppedDeckId,
      cardIds: [droppedCardId],
      playerId: myPlayerId,
      playLocation: 'field',
      coordinate: { x, y },
    };

    socket.emit('card:play', playData);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleCardBack = (card: Card) => {
    if (!myPlayerId) return;

    const backTo = card.fieldBackCondition[0] || 'discard';
    const requestData: CardMoveFromFieldData = {
      roomId,
      deckId: card.deckId || deckId,
      cardId: card.id,
    };

    if (backTo === 'hand') {
      requestData.playerId = myPlayerId;
    }

    socket.emit('card:move-from-field', requestData);
  };

  return (
    <section
      className={`rg-playfield mode-${layoutMode}`}
      style={{
        background: backgroundImage ? `url(${backgroundImage}) center/cover no-repeat` : undefined,
        // 親の zIndex を消すことで、中のカードが Draggable と同じ階層で比較されるようにする
        position: 'relative',
      }}
    >
      <h3 className={playFieldStyles.rgPlayfieldTitle}>
        {title !== undefined && title !== null ? title : `プレイフィールド (deckId=${deckId})`}
      </h3>
      <div
        ref={containerRef}
        className={playFieldStyles.rgPlayFieldContainer}
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
          const isActuallyFreeShape = !!(card.freeShape && card.frontImage);

          const isOverlapping = playedCards
            .slice(0, index)
            .some(
              (other) =>
                Math.abs((other.coordinate?.x ?? 50) - (card.coordinate?.x ?? 50)) < 1 &&
                Math.abs((other.coordinate?.y ?? 50) - (card.coordinate?.y ?? 50)) < 1,
            );
          const visualOffset = isOverlapping ? index * 12 : 0;

          // カード個別の zIndex
          const currentZIndex = isDragging ? baseZIndex + 100 : baseZIndex + 2;

          const freeStyle: React.CSSProperties =
            layoutMode === 'free'
              ? {
                  position: 'absolute',
                  left: `${card.coordinate?.x ?? 50}%`,
                  top: `${card.coordinate?.y ?? 50}%`,
                  zIndex: currentZIndex,
                  transition: isDragging ? 'none' : 'left 0.2s ease, top 0.2s ease',
                }
              : {};

          return (
            <div
              key={card.id}
              draggable={false}
              onDragStart={(e) => e.preventDefault()}
              onPointerDown={(e) => handlePointerDown(e, card)}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              className={`${isActuallyFreeShape ? '' : cardStyles.card} ${playFieldStyles.rgPlayFieldCardWrapper}`}
              style={
                {
                  '--owner-color': owner?.color || '#aaaaaa',
                  ...freeStyle,
                  touchAction: 'none',
                  cursor: isDragging ? 'grabbing' : layoutMode === 'free' ? 'grab' : 'default',
                  width: '80px',
                  height: '112px',
                  background: 'transparent',
                  border: isActuallyFreeShape ? 'none' : undefined,
                  boxShadow: isActuallyFreeShape && isDragging ? '0 0 15px var(--owner-color)' : 'none',
                  padding: 0,
                  display: 'block',
                  alignItems: 'center',
                  justifyContent: 'center',
                } as React.CSSProperties
              }
              onDoubleClick={() => handleCardBack(card)}
            >
              <CardDisplayContent card={card} canSeeFront={true} />

              {card.ownerId && (
                <div className={playFieldStyles.rgPlayFieldOwnerBadge} title={`所有者: ${owner?.name || '不明'}`}>
                  {owner?.name?.[0] || '?'}
                </div>
              )}

              {card.description && !isDragging && <span className={cardStyles.tooltip}>{card.description}</span>}
            </div>
          );
        })}
      </div>
    </section>
  );
}
