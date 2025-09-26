// src/Deck.tsx
import React from "react";
import { Card } from "./Card.js";
import styles from "./Card.module.css";

type DeckProps = {
  cards: Card[];
};

export default function Deck({ cards }: DeckProps) {
  const [deckCards, setDeckCards] = React.useState<Card[]>([...cards]);
  const [flippedCount, setFlippedCount] = React.useState(0);

  const draw = () => {
    if (flippedCount < deckCards.length) {
      setFlippedCount(prev => prev + 1);
    }
  };

  return (
    <section className={styles.deckSection}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: "20px" }}>
        {/* 山札（裏面表示） */}
        <div className={styles.deckContainer} onClick={draw}>
          {deckCards.slice(flippedCount).map((card, index) => (
            <div
              key={card.id}
              className={styles.deckCard}
              style={{
                zIndex: deckCards.length - index,
                transform: `translate(${index * 0.5}px, ${index * 0.5}px)`,
              }}
            />
          ))}
        </div>

        {/* 引いたカード置き場（表面カードを上に重ねる山） */}
        <div className={styles.deckContainer}>
          {deckCards.slice(0, flippedCount).map((card, index) => (
            <div
              key={card.id}
              className={styles.deckCardFront}
              style={{
                zIndex: index + 1,
                transform: `translate(${index * 0.5}px, ${index * 0.5}px)`,
              }}
            >
              {card.name}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
