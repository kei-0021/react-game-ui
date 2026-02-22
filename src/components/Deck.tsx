// src/components/Deck.tsx
import * as React from "react";
import { Socket } from "socket.io-client";
import type { Card } from "../types/card.js";
import { CardLocation } from "../types/cardLocation.js";
import type { DeckId, PlayerId, RoomId } from "../types/definition.js";
import cardStyles from "./Card.module.css";
import deckStyles from "./Deck.module.css";

type DeckProps = {
  socket: Socket;
  roomId: RoomId;
  deckId: DeckId;
  name: string;
  playerId?: PlayerId | null;
};

type DeckUpdateData = {
  currentDeck: Card[];
  drawnCards: Card[];
  discardPile: Card[];
};

const CardContent = ({ card }: { card: Card }) => {
  if (!card.isFaceUp) return null;

  if (card.frontImage) {
    return (
      <img
        src={card.frontImage}
        alt={card.name}
        className={deckStyles.cardImage}
      />
    );
  }

  return (
    <div className={deckStyles.cardNameWrapper}>
      <strong className={deckStyles.cardNameText}>{card.name}</strong>
    </div>
  );
};

export default function Deck({
  socket,
  roomId,
  deckId,
  name,
  playerId = null,
}: DeckProps) {
  const [deckCards, setDeckCards] = React.useState<Card[]>([]);
  const [drawnCards, setDrawnCards] = React.useState<Card[]>([]);
  const [discardPile, setDiscardPile] = React.useState<Card[]>([]);
  const [isDiscardHovered, setIsDiscardHovered] = React.useState(false);

  React.useEffect(() => {
    socket.on(`deck:init:${roomId}:${deckId}`, (data: DeckUpdateData) => {
      setDeckCards(data.currentDeck.map((c) => ({ ...c, deckId })));
      setDrawnCards(data.drawnCards.map((c) => ({ ...c, deckId })));
      setDiscardPile(data.discardPile.map((c) => ({ ...c, deckId })));
    });

    socket.on(`deck:update:${roomId}:${deckId}`, (data: DeckUpdateData) => {
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

    const requestData: {
      roomId: RoomId;
      deckId: DeckId;
      playerId?: PlayerId | null;
      drawLocation: CardLocation;
    } = {
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
    <section className={cardStyles.deckSection}>
      <h3 className={deckStyles.deckTitle}>{name}</h3>

      <div className={cardStyles.deckControls}>
        <button onClick={shuffle}>シャッフル</button>
        <button onClick={resetDeck}>山札に戻す</button>
      </div>

      <div
        className={`${cardStyles.deckWrapper} ${deckStyles.deckWrapperFlex}`}
      >
        {/* 山札 */}
        <div className={cardStyles.deckContainer} onClick={draw}>
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

        {/* ドロー済み */}
        <div className={cardStyles.deckContainer}>
          {drawnCards.map((c, i) => (
            <div
              key={c.id}
              className={cardStyles.deckCardFront}
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
        <div
          className={`${cardStyles.deckContainer} ${cardStyles.discardPileWrapper}`}
        >
          {discardPile.map((c, i) => (
            <div
              key={c.id}
              className={cardStyles.deckCardFront}
              style={{
                zIndex: i + 1,
                transform: `translate(${i * -0.3}px, ${i * -0.3}px)`,
                pointerEvents: i === discardPile.length - 1 ? "auto" : "none",
              }}
              onMouseEnter={() =>
                i === discardPile.length - 1 && setIsDiscardHovered(true)
              }
              onMouseLeave={() =>
                i === discardPile.length - 1 && setIsDiscardHovered(false)
              }
            >
              <CardContent card={c} />

              {i === discardPile.length - 1 && c.description && (
                <span
                  className={`${cardStyles.tooltip} ${deckStyles.tooltipBase}`}
                  style={{
                    visibility: isDiscardHovered ? "visible" : "hidden",
                    opacity: isDiscardHovered ? 1 : 0,
                  }}
                >
                  {c.description}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
