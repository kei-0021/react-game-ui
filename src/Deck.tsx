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

  const shuffle = () => {
    // 山札（めくっていない部分）だけシャッフル
    const remaining = deckCards.slice(flippedCount);
    for (let i = remaining.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [remaining[i], remaining[j]] = [remaining[j], remaining[i]];
    }

    // めくったカードはそのまま残して残りを更新
    setDeckCards([...deckCards.slice(0, flippedCount), ...remaining]);
  };

  const resetFlipped = () => {
    setFlippedCount(0);
  };

  return (
    <section className={styles.deckSection}>
      {/* 操作ボタン */}
      <div style={{ marginBottom: "10px" }}>
        <button onClick={shuffle} style={{ marginRight: "8px" }}>シャッフル</button>
        <button onClick={resetFlipped}>めくったカードを戻す</button>
      </div>

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
