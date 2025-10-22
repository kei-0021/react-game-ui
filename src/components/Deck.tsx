// src/components/Deck.tsx (roomId対応版)
import * as React from "react";
import { Socket } from "socket.io-client";
import type { Card } from "../types/card.js";
import { CardLocation } from "../types/cardLocation.js";
import type { DeckId, PlayerId, RoomId } from "../types/definition.js";
import styles from "./Card.module.css";

type DeckProps = {
  socket: Socket;
  roomId: RoomId;
  deckId: DeckId;
  name: string;
  playerId?: PlayerId | null;
};

// サーバーから受信するデータ型
type DeckUpdateData = { 
  currentDeck: Card[], 
  drawnCards: Card[], 
  discardPile: Card[] 
};

// =========================================================================
// カードの内容表示コンポーネント
// =========================================================================
const CardContent = ({ card }: { card: Card }) => {
  if (!card.isFaceUp) return null;

  if (card.frontImage) {
    return (
      <img
        src={card.frontImage}
        alt={card.name}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "contain",
        }}
      />
    );
  } else {
    console.log(`[CardContent] pngの描画失敗: ${card.id}. Path: ${card.frontImage}`);
  }

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        width: "100%",
        padding: "5px",
      }}
    >
      <strong style={{ fontSize: "1em", wordBreak: "break-all", textAlign: "center" }}>
        {card.name}
      </strong>
    </div>
  );
};

// =========================================================================
// Deck コンポーネント
// =========================================================================
export default function Deck({ socket, roomId, deckId, name, playerId = null }: DeckProps) {
  const [deckCards, setDeckCards] = React.useState<Card[]>([]);
  const [drawnCards, setDrawnCards] = React.useState<Card[]>([]);
  const [discardPile, setDiscardPile] = React.useState<Card[]>([]);
  const [isDiscardHovered, setIsDiscardHovered] = React.useState(false);

  React.useEffect(() => {
    // デッキ初期化イベント購読
    socket.on(`deck:init:${roomId}:${deckId}`, (data: DeckUpdateData) => {
      setDeckCards(data.currentDeck.map((c) => ({ ...c, deckId })));
      setDrawnCards(data.drawnCards.map((c) => ({ ...c, deckId })));
      setDiscardPile(data.discardPile.map((c) => ({ ...c, deckId })));
    });

    // デッキ更新イベント購読
    socket.on(`deck:update:${roomId}:${deckId}`, (data: DeckUpdateData) => {
      console.log(`[Deck Update:${roomId}]`, data);
      setDeckCards(data.currentDeck.map((c) => ({ ...c, deckId })));
      setDrawnCards(data.drawnCards.map((c) => ({ ...c, deckId })));
      setDiscardPile(data.discardPile.map((c) => ({ ...c, deckId })));
    });

    return () => {
      socket.off(`deck:init:${roomId}:${deckId}`);
      socket.off(`deck:update:${roomId}:${deckId}`);
    };
  }, [socket, roomId, deckId]);

  const draw = () => {
    if (deckCards.length === 0) return;
    const cardToDraw = deckCards[0];
    const drawLocation = cardToDraw?.drawLocation || "hand";

    const requestData: { roomId: RoomId; deckId: DeckId; playerId?: PlayerId | null; drawLocation: CardLocation } = {
      roomId,
      deckId,
      drawLocation,
    };

    if (drawLocation === "hand" && playerId) {
      requestData.playerId = playerId;
    }

    socket.emit("deck:draw", requestData);
  };

  const shuffle = () => socket.emit("deck:shuffle", { roomId, deckId });
  const resetDeck = () => socket.emit("deck:reset", { roomId, deckId });

  return (
    <section className={styles.deckSection}>
      <h3 style={{ marginBottom: "6px" }}>{name}</h3>

      <div className={styles.deckControls}>
        <button onClick={shuffle}>シャッフル</button>
        <button onClick={resetDeck}>山札に戻す</button>
      </div>

      <div className={styles.deckWrapper} style={{ display: "flex", gap: "0px" }}>
        {/* 山札 */}
        <div className={styles.deckContainer} onClick={draw}>
          {deckCards.map((c, i) => (
            <div
              key={c.id}
              className={styles.deckCard}
              style={{
                zIndex: deckCards.length - i,
                transform: `translate(${i * 0.3}px, ${i * 0.3}px)`,
                backgroundColor: c.backColor,
              }}
            />
          ))}
        </div>

        {/* ドロー済み */}
        <div className={styles.deckContainer}>
          {drawnCards.map((c, i) => (
            <div
              key={c.id}
              className={styles.deckCardFront}
              style={{
                zIndex: i + 1,
                transform: `translate(${i * 0.3}px, ${i * 0.3}px)`,
              }}
            >
              <CardContent card={c} />
            </div>
          ))}
        </div>

        {/* 捨て札 */}
        <div className={`${styles.deckContainer} ${styles.discardPileWrapper}`}>
          {discardPile.length > 0 && (() => {
            const topCard = discardPile[discardPile.length - 1];
            return (
              <div
                key={topCard.id}
                className={`${styles.deckCardFront} ${styles.discardTopCard}`}
                style={{ pointerEvents: "auto" }}
                onMouseEnter={() => setIsDiscardHovered(true)}
                onMouseLeave={() => setIsDiscardHovered(false)}
              >
                <CardContent card={topCard} />
                {topCard.description && (
                  <span
                    className={styles.tooltip}
                    style={{
                      visibility: isDiscardHovered ? "visible" : "hidden",
                      opacity: isDiscardHovered ? 1 : 0,
                      zIndex: 9999,
                    }}
                  >
                    {topCard.description}
                  </span>
                )}
              </div>
            );
          })()}
        </div>
      </div>
    </section>
  );
}
