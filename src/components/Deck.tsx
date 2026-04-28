// src/components/Deck.tsx
import { DeckDrawData, DeckResetData, DeckShuffleData, DeckUpdateData } from '@/types/socketData.js';
import * as React from 'react';
import { useEffect } from 'react';
import { Socket } from 'socket.io-client';
import type { CardData } from '../types/card.js';
import type { DeckId, PlayerId, RoomId } from '../types/definition.js';
import { Card, CardDisplayContent } from './Card/Card.js';
import deckStyles from './Deck.module.css';

type DeckProps = {
  socket: Socket;
  roomId: RoomId;
  deckId: DeckId;
  title: string;
  currentPlayerId: PlayerId | null;
  myPlayerId: PlayerId | null;
  alwaysDraw?: boolean;
  size?: { width: number; height: number };
  enabled?: boolean;
};

/**
 * 山札の描画、シャッフル、ドローの制御を行う。
 * @param socket - 通信用のSocket.ioインスタンス
 * @param roomId - 対象のルームID
 * @param deckId - 山札を識別する一意のID
 * @param title - 山札の表示名
 * @param myPlayerId - 操作者自身のプレイヤーID。手札へのドロー先として使用。
 * @param currentPlayerId - 現在のターンプレイヤーID。ターン制の判定に使用。
 * @param alwaysDraw - ターンの制約を無視してドロー可能にするフラグ。
 * @param size={ width: 90, height: 120 } - デッキのサイズ。
 * @param enabled=true - 各種操作が有効かどうかのフラグ。
 */
export function Deck({
  socket,
  roomId,
  deckId,
  title,
  myPlayerId,
  currentPlayerId,
  alwaysDraw = false,
  size = { width: 90, height: 120 },
  enabled = true,
}: DeckProps) {
  const [deckCards, setDeckCards] = React.useState<CardData[]>([]);
  const [discardPile, setDiscardPile] = React.useState<CardData[]>([]);
  const [showDiscardModal, setShowDiscardModal] = React.useState(false);

  useEffect(() => {
    socket.on(`deck:update:${deckId}`, (data: DeckUpdateData) => {
      setDeckCards(data.currentDeck.map((c) => ({ ...c, deckId })));
      setDiscardPile(data.discardPile.map((c) => ({ ...c, deckId })));
    });

    return () => {
      socket.off(`deck:update:${deckId}`);
    };
  }, [socket, roomId, deckId]);

  const draw = () => {
    if (!deckCards || deckCards.length === 0) return;
    const cardToDraw = deckCards[0];
    const [targetLocation, targetState] = cardToDraw.drawCondition || ['hand', 'back'];

    // 送信用データの作成
    const requestData: DeckDrawData = {
      roomId,
      deckId,
      drawCondition: [targetLocation, targetState],
    };

    // 権限チェック
    if (targetLocation === 'hand') {
      const canDrawToHand = alwaysDraw || currentPlayerId === myPlayerId;

      if (canDrawToHand && myPlayerId) {
        requestData.playerId = myPlayerId;
      } else {
        console.warn('手札に引く権限がありません。');
        return;
      }
    }

    socket.emit('deck:draw', requestData);
  };

  const shuffle = () => socket.emit('deck:shuffle', { roomId, deckId } as DeckShuffleData);
  const resetDeck = () => socket.emit('deck:reset', { roomId, deckId } as DeckResetData);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault(); // 標準メニューを阻止
    if (discardPile.length === 0) return;

    // 捨て札確認モーダルを開くフラグを立てる
    setShowDiscardModal(true);
  };

  return (
    <section className={deckStyles.deckSection}>
      <h3 className={deckStyles.deckTitle}>{title}</h3>

      <div className={deckStyles.deckControls}>
        <button onClick={shuffle} disabled={!enabled}>
          シャッフル
        </button>
        <button onClick={resetDeck} disabled={!enabled}>
          山札に戻す
        </button>
      </div>

      <div className={deckStyles.deckWrapperFlex}>
        {/* 山札 */}
        <div
          className={`${deckStyles.deckContainer} ${!enabled ? deckStyles.disabled : ''}`}
          style={{ width: size.width, height: size.height }}
        >
          {/* 枚数バッジ */}
          {deckCards.length > 0 && <div className={deckStyles.deckCountBadge}>{deckCards.length}</div>}

          {deckCards.map((c, i) => (
            <div
              key={c.id}
              className={deckStyles.deckCard}
              style={{
                width: size.width,
                height: size.height,
                zIndex: deckCards.length - i,
                transform: `translate(${i * 0.3}px, ${i * 0.3}px)`,
              }}
            >
              <Card card={c} canSeeFront={false} showPreview={false} size={size} onClick={() => enabled && draw()} />
            </div>
          ))}
        </div>

        {/* 捨て札 */}
        <div
          className={`${deckStyles.deckContainer} ${deckStyles.discardPileWrapper}`}
          style={{ width: size.width, height: size.height }}
          onContextMenu={handleContextMenu}
        >
          {discardPile.map((c, i) => (
            <div
              className={deckStyles.deckCard}
              style={{
                width: size.width,
                height: size.height,
                zIndex: i + 1,
                transform: `translate(${i * -0.3}px, ${i * -0.3}px)`,
              }}
            >
              <Card card={c} canSeeFront={true} showPreview={true} size={size} />
            </div>
          ))}
        </div>

        {/* 右クリックで過去のカード履歴表示 */}
        {showDiscardModal && (
          <div className={deckStyles.discardModalOverlay} onClick={() => setShowDiscardModal(false)}>
            <div className={deckStyles.discardModalContent} onClick={(e) => e.stopPropagation()}>
              <div className={deckStyles.discardModalHeader}>
                <h4>捨て札の内容</h4>
                <button onClick={() => setShowDiscardModal(false)}>閉じる</button>
              </div>
              <div className={deckStyles.discardModalGrid}>
                {discardPile
                  .slice()
                  .reverse()
                  .map((c) => (
                    <div key={c.id} className={deckStyles.discardModalCard}>
                      <CardDisplayContent card={c} canSeeFront={true} size={size} />
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
