// src/components/PlayField.tsx

import { Player } from '@/types/player.js';
import {
  CardFlipData,
  CardMoveFromFieldData,
  CardMoveOnFieldData,
  CardPlayData,
  DeckUpdateData,
} from '@/types/socketData.js';
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
  zIndex?: number;
  isDebug?: boolean;
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
 * @param {string} [zIndex] - カードの重ね順
 * @param {boolean} [isDebug=false] - z-indexをUI表示するフラグ (デバッグ用)
 */
export function PlayField({
  socket,
  roomId,
  deckId,
  title,
  players,
  myPlayerId,
  layoutMode = 'free',
  backgroundImage,
  zIndex = 100,
  isDebug = false,
}: PlayFieldProps) {
  const [playedCards, setPlayedCards] = React.useState<Card[]>([]);
  const [activeDraggingId, setActiveDraggingId] = React.useState<string | null>(null);

  // ドラッグ中のローカルな座標を保持（ラグを消すためのステート）
  const [dragPos, setDragPos] = React.useState<{ x: number; y: number } | null>(null);

  // 右クリックメニュー用のステート (Draggableの仕様に合わせる)
  const [contextMenu, setContextMenu] = React.useState<{ x: number; y: number; card: Card } | null>(null);

  const containerRef = React.useRef<HTMLDivElement>(null);
  const draggingIdRef = React.useRef<string | null>(null);

  // メニュー外クリックで閉じる (Draggableと同様の処理)
  React.useEffect(() => {
    const closeMenu = () => setContextMenu(null);
    if (contextMenu) {
      window.addEventListener('click', closeMenu);
    }
    return () => window.removeEventListener('click', closeMenu);
  }, [contextMenu]);

  React.useEffect(() => {
    socket.on(`deck:update:${deckId}`, (data: DeckUpdateData) => {
      const newCards = data.playFieldCards || [];
      setPlayedCards(newCards);
    });

    return () => {
      socket.off(`deck:update:${deckId}`);
    };
  }, [socket, roomId, deckId]);

  // リアルタイム送信ロジック（throttleを30msに短縮して追従性を向上）
  // 宛先をその都度書くスタイルにしてクロージャ問題を回避
  const emitMove = React.useMemo(
    () =>
      throttle((cardId: string, clientX: number, clientY: number, rId: RoomId, dId: DeckId) => {
        if (!containerRef.current || !rId || !dId) return;

        const rect = containerRef.current.getBoundingClientRect();

        // 座標計算 & 0-100% の範囲にクランプ
        let x = ((clientX - rect.left) / rect.width) * 100;
        let y = ((clientY - rect.top) / rect.height) * 100;

        x = Math.max(0, Math.min(100, x));
        y = Math.max(0, Math.min(100, y));

        socket.emit('card:move-on-field', {
          roomId: rId,
          deckId: dId,
          cardId,
          coordinate: { x, y },
        });
      }, 30),
    [socket],
  );

  const handlePointerDown = (e: React.PointerEvent, card: Card) => {
    if (layoutMode !== 'free') return;
    draggingIdRef.current = card.id;
    setActiveDraggingId(card.id);

    // 掴んだ瞬間の座標を即座にステートに入れる
    setDragPos({ x: card.coordinate?.x ?? 50, y: card.coordinate?.y ?? 50 });

    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);

    // 全カードの中から最大の zIndex を探す
    const maxZ = Math.max(...playedCards.map((c) => c.zIndex ?? 100), 100);

    // 自分が最大でなければ、maxZ + 1 を自分に割り当てる
    if ((card.zIndex ?? 0) < maxZ) {
      card.zIndex = maxZ + 1;
    }
  };

  // 右クリックハンドラ (Draggableの形式に合わせる)
  const handleContextMenu = (e: React.MouseEvent, card: Card) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY, card });
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!draggingIdRef.current || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();

    // 画面更新用のローカル座標を計算
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));

    // 通信とは別に、自分の画面の表示を即座に更新する
    setDragPos({ x, y });

    // Propsの最新値を引数として渡す
    emitMove(draggingIdRef.current, e.clientX, e.clientY, roomId, deckId);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!draggingIdRef.current) return;
    // 終了時も最新のIDを添えて送信
    emitMove(draggingIdRef.current, e.clientX, e.clientY, roomId, deckId);
    (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    draggingIdRef.current = null;
    setActiveDraggingId(null);
    setDragPos(null);
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
    if (!myPlayerId || !card.fieldBackCondition) return;

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
        {playedCards.map((card) => {
          const owner = players.find((p) => p.id === card.ownerId);
          const isDragging = activeDraggingId === card.id;
          const isActuallyFreeShape = !!(card.freeShape && card.frontImage);

          // ドラッグ中ならローカルの座標、そうでなければカード情報の座標を使用
          const displayX = isDragging && dragPos ? dragPos.x : (card.coordinate?.x ?? 50);
          const displayY = isDragging && dragPos ? dragPos.y : (card.coordinate?.y ?? 50);

          // 表示用の最終的な zIndex
          const currentZIndex = isDragging ? zIndex + 1000 : (card.zIndex ?? zIndex + 2);

          const freeStyle: React.CSSProperties =
            layoutMode === 'free'
              ? {
                  position: 'absolute',
                  left: `${displayX}%`,
                  top: `${displayY}%`,
                  zIndex: currentZIndex,
                  // マウスの先端ではなく、カードの中心を掴むように補正
                  transform: 'translate(-50%, -50%)',
                  // ドラッグ中はアニメーションを切り、それ以外は滑らかに戻る
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
              onContextMenu={(e) => handleContextMenu(e, card)}
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
                  position: layoutMode === 'free' ? 'absolute' : 'relative',
                  zIndex: currentZIndex,
                } as React.CSSProperties
              }
            >
              <CardDisplayContent card={card} canSeeFront={card.isFaceUp} />

              {/* オーナーバッジ */}
              {card.ownerId && (
                <div className={playFieldStyles.rgPlayFieldOwnerBadge} title={`所有者: ${owner?.name || '不明'}`}>
                  {owner?.name?.[0] || '?'}
                </div>
              )}

              {/* デバッグ用 z-index ラベル */}
              {isDebug && (
                <div className={playFieldStyles.debugLabel} style={{ zIndex: 10001 }}>
                  Z:{currentZIndex}
                </div>
              )}

              {/* ツールチップ */}
              {card.description && !isDragging && card.isFaceUp && (
                <span className={cardStyles.tooltip}>{card.description}</span>
              )}
            </div>
          );
        })}

        {/* DraggableのCSSクラス名に合わせた右クリックメニュー */}
        {contextMenu && (
          <div
            className={playFieldStyles.contextMenu}
            style={{
              top: contextMenu.y,
              left: contextMenu.x,
              position: 'fixed', // Draggableに合わせてfixed
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className={playFieldStyles.menuItem}
              onClick={() => {
                const maxZ = Math.max(...playedCards.map((c) => c.zIndex ?? 100), 100);
                const requestData: CardMoveOnFieldData = {
                  roomId,
                  deckId: contextMenu.card.deckId || deckId,
                  cardId: contextMenu.card.id,
                  coordinate: contextMenu.card.coordinate,
                  zIndex: maxZ + 1,
                };
                socket.emit('card:move-on-field', requestData);
                setContextMenu(null);
              }}
            >
              <span className={playFieldStyles.menuIcon}>⬆️</span>
              <span>最前面へ移動</span>
            </div>

            <div
              className={playFieldStyles.menuItem}
              onClick={() => {
                const minZ = Math.min(...playedCards.map((c) => c.zIndex ?? 100), 100);
                const requestData: CardMoveOnFieldData = {
                  roomId,
                  deckId: contextMenu.card.deckId || deckId,
                  cardId: contextMenu.card.id,
                  coordinate: contextMenu.card.coordinate,
                  zIndex: Math.max(0, minZ - 1),
                };
                socket.emit('card:move-on-field', requestData);
                setContextMenu(null);
              }}
            >
              <span className={playFieldStyles.menuIcon}>⬇️</span>
              <span>最背面へ移動</span>
            </div>

            <div style={{ height: '1px', background: '#444', margin: '4px 0' }} />

            <div
              className={playFieldStyles.menuItem}
              onClick={() => {
                socket.emit('card:flip', {
                  roomId: roomId,
                  playerId: myPlayerId,
                  cardIds: [contextMenu.card.id],
                } as CardFlipData);
                setContextMenu(null);
              }}
            >
              <span className={playFieldStyles.menuIcon}>🔄</span>
              <span>カードを裏返す</span>
            </div>

            {contextMenu.card.fieldBackCondition && (
              <div
                className={playFieldStyles.menuItem}
                onClick={() => {
                  handleCardBack(contextMenu.card);
                  setContextMenu(null);
                }}
              >
                <span className={playFieldStyles.menuIcon}>✋</span>
                <span>手札/捨て札へ戻す</span>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
