// src/components/Deck.tsx
import React from "react";
import { Socket } from "socket.io-client";
import { Card } from "../types/card.js";
import styles from "./Card.module.css";

type DeckProps = {
  socket: Socket;
  playerId?: string | null; // 手札に入れる場合のプレイヤーID、nullなら場
};

export default function Deck({ socket, playerId = null }: DeckProps) {
  const [deckCards, setDeckCards] = React.useState<Card[]>([]);
  const [drawnCards, setDrawnCards] = React.useState<Card[]>([]);

  React.useEffect(() => {
    socket.on("deck:init", (data: { currentDeck: Card[], drawnCards: Card[] }) => {
      console.log("Deck.tsx: deck:init 受信", data);
      setDeckCards(data.currentDeck);
      setDrawnCards(data.drawnCards);
    });

    socket.on("deck:update", (data: { currentDeck: Card[], drawnCards: Card[] }) => {
      // console.log("Deck.tsx: deck:update 受信", data);
      setDeckCards(data.currentDeck);
      setDrawnCards(data.drawnCards);
    });

    return () => {
      socket.off("deck:init");
      socket.off("deck:update");
    };
  }, [socket]);

  const draw = () => {
    if (deckCards.length === 0) return;
    console.log("Deck.tsx: 山札クリックで draw");

    // playerId が null なら場に置く、あればそのプレイヤーの手札に
    console.log()
    socket.emit("deck:draw", { playerId });
  };

  const shuffle = () => {
    console.log("Deck.tsx: shuffle ボタン押下");
    socket.emit("deck:shuffle");
  };

  const resetDeck = () => {
    console.log("Deck.tsx: 山札に戻すボタン押下");
    socket.emit("deck:reset");
  };

  return (
    <section className={styles.deckSection}>
      <div className={styles.deckControls}>
        <button onClick={shuffle}>シャッフル</button>
        <button onClick={resetDeck}>山札に戻す</button>
      </div>

      <div className={styles.deckWrapper}>
        {/* 山札（裏面） */}
        <div className={styles.deckContainer} onClick={draw}>
          {deckCards.map((c, i) => (
            <div
              key={c.id}
              className={styles.deckCard}
              style={{
                zIndex: deckCards.length - i,
                transform: `translate(${i * 0.5}px, ${i * 0.5}px)`,
              }}
            />
          ))}
        </div>

        {/* 引いたカード（表面・場用） */}
        <div className={styles.deckContainer}>
          {drawnCards.map((c, i) => (
            <div
              key={c.id}
              className={styles.deckCardFront}
              style={{
                zIndex: i + 1,
                transform: `translate(${i * 0.5}px, ${i * 0.5}px)`,
              }}
            >
              {c.name}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
