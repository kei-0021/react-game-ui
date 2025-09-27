// src/components/Deck.tsx
import React from "react";
import { Socket } from "socket.io-client";
import type { Card, DeckId } from "../types/card.js"; // 実際に使用
import { PlayerId } from "../types/player.js"; // 型参照
import styles from "./Card.module.css";

type DeckProps = {
  socket: Socket;
  deckId: DeckId;               // 追加
  playerId?: PlayerId | null;
};

export default function Deck({ socket, deckId, playerId = null }: DeckProps) {
  const [deckCards, setDeckCards] = React.useState<Card[]>([]);
  const [drawnCards, setDrawnCards] = React.useState<Card[]>([]);

  React.useEffect(() => {
    socket.on(`deck:init:${deckId}`, (data: { currentDeck: Card[], drawnCards: Card[] }) => {
      setDeckCards(data.currentDeck.map(c => ({ ...c, deckId })));
      setDrawnCards(data.drawnCards.map(c => ({ ...c, deckId })));
    });

    socket.on(`deck:update:${deckId}`, (data: { currentDeck: Card[], drawnCards: Card[] }) => {
      setDeckCards(data.currentDeck.map(c => ({ ...c, deckId })));
      setDrawnCards(data.drawnCards.map(c => ({ ...c, deckId })));
    });

    return () => {
      socket.off(`deck:init:${deckId}`);
      socket.off(`deck:update:${deckId}`);
    };
  }, [socket, deckId]);

  const draw = () => {
    if (deckCards.length === 0) return;
    socket.emit("deck:draw", { deckId, playerId });
  };

  const shuffle = () => socket.emit("deck:shuffle", { deckId });
  const resetDeck = () => socket.emit("deck:reset", { deckId });

  return (
    <section className={styles.deckSection}>
      <div className={styles.deckControls}>
        <button onClick={shuffle}>シャッフル</button>
        <button onClick={resetDeck}>山札に戻す</button>
      </div>

      <div className={styles.deckWrapper}>
        <div className={styles.deckContainer} onClick={draw}>
          {deckCards.map((c, i) => (
            <div
              key={c.id}
              className={styles.deckCard}
              style={{ zIndex: deckCards.length - i, transform: `translate(${i * 0.5}px, ${i * 0.5}px)` }}
            />
          ))}
        </div>

        <div className={styles.deckContainer}>
          {drawnCards.map((c, i) => (
            <div
              key={c.id}
              className={styles.deckCardFront}
              style={{ zIndex: i + 1, transform: `translate(${i * 0.5}px, ${i * 0.5}px)` }}
            >
              {c.name}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
