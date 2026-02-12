// src/components/PlayField.tsx

import * as React from "react";
import { Socket } from "socket.io-client";
import type { Card } from "../types/card.js";
import type { DeckId, PlayerId, RoomId } from "../types/definition.js";
import type { PlayerWithResources } from "../types/playerWithResources.js";
import { client_log } from "../utils/client-log.js";
import styles from "./Card.module.css";
import "./PlayField.css";

const CardDisplayContent = ({
  card,
  isFaceUp,
}: {
  card: Card;
  isFaceUp: boolean;
}) => {
  if (!isFaceUp) {
    console.log(
      `[CardDisplayContent] Card ID: ${card.id}, Name: ${card.name} - isFaceUp is false. Not rendering.`,
    );
    return null;
  }

  if (card.frontImage) {
    console.log(
      `[CardDisplayContent] Card ID: ${card.id}, Name: ${card.name} - Rendering with frontImage: ${card.frontImage}`,
    );
    return (
      <img src={card.frontImage} alt={card.name} className="rg-card-image" />
    );
  }

  console.log(
    `[CardDisplayContent] Card ID: ${card.id}, Name: ${card.name} - Rendering with card.name (No frontImage).`,
  );
  return (
    <div className="rg-card-text-content">
      <strong className="rg-card-name-label">{card.name}</strong>
    </div>
  );
};

type PlayFieldProps = {
  socket: Socket;
  roomId: RoomId;
  deckId: DeckId;
  name: string;
  is_logging?: boolean;
  players: PlayerWithResources[];
  myPlayerId: string | null;
};

export default function PlayField({
  socket,
  roomId,
  deckId,
  name,
  is_logging = false,
  players,
  myPlayerId,
}: PlayFieldProps) {
  const [playedCards, setPlayedCards] = React.useState<Card[]>([]);

  React.useEffect(() => {
    const handleUpdate = (data: { playFieldCards?: Card[] }) => {
      const newCards = data.playFieldCards || [];

      if (is_logging) {
        client_log("playField", `[${deckId}] 場の状態を更新`);
        client_log(
          "playField",
          `[${deckId}] 古いカード数: ${playedCards.length}, 新しいカード数: ${newCards.length}`,
        );
        client_log(
          "playField",
          `[${deckId}] 受信したカードリスト:`,
          newCards.map((c) => c.name),
        );
      }

      console.log(
        `[PlayField] Deck ${deckId} - Received ${newCards.length} cards for rendering.`,
      );
      setPlayedCards(newCards);
    };

    socket.on(`deck:update:${roomId}:${deckId}`, handleUpdate);

    return () => {
      socket.off(`deck:update:${roomId}:${deckId}`, handleUpdate);
    };
  }, [socket, roomId, deckId]);

  // カードを適切な場所（手札 or 捨て札）へ移動させる
  const handleCardBack = (card: Card) => {
    const backTo = card.fieldBackLocation || "discard";

    // 型定義を明示（targetPlayerId は string または undefined）
    const requestData: {
      roomId: RoomId;
      deckId: DeckId;
      cardId: string;
      targetPlayerId?: PlayerId;
    } = {
      roomId,
      deckId: card.deckId || deckId,
      cardId: card.id,
    };

    // 手札に戻す設定の場合のみ、所有者IDをセット
    if (backTo === "hand") {
      if (!card.ownerId) {
        client_log(
          "playField",
          `警告: ${card.name} は手札指定ですが所有者が不明です。`,
        );
        return;
      }
      requestData.targetPlayerId = card.ownerId;
    }

    socket.emit("card:move-from-field", requestData);

    client_log(
      "playField",
      `カード ${card.name} を ${backTo} へ移動リクエスト`,
    );
  };

  return (
    <section className="rg-playfield">
      <h3 className="rg-playfield-title">
        プレイエリア
        {name && <span className="rg-playfield-subtitle">（{name}）</span>}
      </h3>
      <div className="rg-playfield-container">
        {playedCards.length === 0 && (
          <div className="rg-playfield-empty">（まだカードが出ていません）</div>
        )}
        {playedCards.map((card) => {
          const owner = card.ownerId
            ? players.find((p) => p.id === card.ownerId)
            : null;
          const ownerColor = owner?.color || "#aaaaaa";
          const ownerNameInitial = owner?.name?.[0] || "?";

          return (
            <div
              key={card.id}
              className={`${styles.card} rg-playfield-card-wrapper`}
              style={{ "--owner-color": ownerColor } as React.CSSProperties}
              // ダブルクリックで戻す
              onDoubleClick={() => handleCardBack(card)}
            >
              <CardDisplayContent card={card} isFaceUp={true} />

              {card.ownerId && (
                <div
                  className="rg-playfield-owner-badge"
                  title={`所有者: ${owner?.name || "不明"}`}
                >
                  {ownerNameInitial}
                </div>
              )}

              {card.description && (
                <span className={styles.tooltip}>{card.description}</span>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
