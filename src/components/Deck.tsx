// src/components/Deck.tsx
import { DeckDrawData, DeckUpdateData } from '@/types/socketData.js';
import * as React from 'react';
import { useEffect } from 'react';
import { Socket } from 'socket.io-client';
import type { Card } from '../types/card.js';
import type { DeckId, PlayerId, RoomId } from '../types/definition.js';
import { CardDisplayContent } from './Card.js';
import cardStyles from './Card.module.css';
import { CardPreview } from './CardPreview.js';
import deckStyles from './Deck.module.css';

type DeckProps = {
  socket: Socket;
  roomId: RoomId;
  deckId: DeckId;
  title: string;
  currentPlayerId: PlayerId | null;
  myPlayerId: PlayerId | null;
  alwaysDraw?: boolean;
  enabled?: boolean;
};

/**
 * 山札の描画、シャッフル、ドローの制御を行う。
 * @param socket - 通信用のSocket.ioインスタンス
 * @param roomId - 対象のルームID
 * @param deckId - 山札を識別する一意のID
 * @param title - 山札の表示名
 * @param currentPlayerId - 現在のターンプレイヤーID。ターン制の判定に使用。
 * @param myPlayerId - 操作者自身のプレイヤーID。手札へのドロー先として使用。
 * @param alwaysDraw - ターンの制約を無視してドロー可能にするフラグ。
 * @param enabled=true - 各種操作が有効かどうかのフラグ。
 */
export function Deck({
  socket,
  roomId,
  deckId,
  title,
  currentPlayerId,
  myPlayerId,
  alwaysDraw = false,
  enabled = true,
}: DeckProps) {
  const [deckCards, setDeckCards] = React.useState<Card[]>([]);
  const [discardPile, setDiscardPile] = React.useState<Card[]>([]);
  const [isDiscardHovered, setIsDiscardHovered] = React.useState(false);

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

  const shuffle = () => socket.emit('deck:shuffle', { roomId, deckId });
  const resetDeck = () => socket.emit('deck:reset', { roomId, deckId });

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
          className={`${cardStyles.deckContainer} ${!enabled ? cardStyles.disabled : ''}`}
          onClick={() => enabled && draw()}
        >
          {deckCards.map((c, i) => (
            <div
              key={c.id}
              className={cardStyles.deckCard}
              style={{
                zIndex: deckCards.length - i,
                transform: `translate(${i * 0.3}px, ${i * 0.3}px)`,
                backgroundColor: c.backColor,
              }}
            />
          ))}
        </div>

        {/* 捨て札 */}
        <div className={`${cardStyles.deckContainer} ${cardStyles.discardPileWrapper}`}>
          {discardPile.map((c, i) => (
            <CardPreview key={c.id} card={c}>
              <div
                className={cardStyles.deckCardFront}
                style={{
                  zIndex: i + 1,
                  transform: `translate(${i * -0.3}px, ${i * -0.3}px)`,
                }}
              >
                <CardDisplayContent card={c} canSeeFront={true} />
              </div>
            </CardPreview>
          ))}
        </div>
      </div>
    </section>
  );
}
