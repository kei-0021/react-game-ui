// src/components/PlayField.tsx (roomId対応版)

import * as React from "react";
import { Socket } from "socket.io-client";
import type { Card } from "../types/card.js";
import type { DeckId, RoomId } from "../types/definition.js";
import { client_log } from "../utils/client-log.js";
import styles from "./Card.module.css";

// =========================================================================
// カード表面の内容をレンダリングするコンポーネント
// =========================================================================
const CardDisplayContent = ({ card, isFaceUp }: { card: Card; isFaceUp: boolean }) => {
  if (!isFaceUp) return null;

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
        color: "#333",
      }}
    >
      <strong style={{ fontSize: "0.8em", wordBreak: "break-all", textAlign: "center" }}>
        {card.name}
      </strong>
    </div>
  );
};

// =========================================================================
// PlayField コンポーネント
// =========================================================================
type PlayFieldProps = {
  socket: Socket;
  roomId: RoomId; // ⭐ 追加
  deckId: DeckId;
  name: string;
  is_logging?: boolean;
};

export default function PlayField({
  socket,
  roomId, // ⭐ 追加
  deckId,
  name,
  is_logging = false,
}: PlayFieldProps) {
  const [playedCards, setPlayedCards] = React.useState<Card[]>([]);

  React.useEffect(() => {
    const handleUpdate = (data: { playFieldCards?: Card[] }) => {
      const newCards = data.playFieldCards || [];

      if (is_logging) {
        client_log("playField", `[${deckId}] 場の状態を更新`);
        client_log("playField", `[${deckId}] 古いカード数: ${playedCards.length}, 新しいカード数: ${newCards.length}`);
        client_log("playField", `[${deckId}] 受信したカードリスト:`, newCards.map((c) => c.name));
      }

      setPlayedCards(newCards);
    };

    // ⭐ roomIdを含めたイベント購読
    socket.on(`deck:update:${roomId}:${deckId}`, handleUpdate);

    return () => {
      socket.off(`deck:update:${roomId}:${deckId}`, handleUpdate);
    };
  }, [socket, roomId, deckId]);

  // ⭐ roomId付きで手札に戻す
  const returnCardToOwnerHand = (card: Card) => {
    if (!card.ownerId) {
      client_log("playField", `警告: ${card.name} には所有者IDが設定されていません。手札に戻せません。`);
      return;
    }

    socket.emit("card:return-to-hand", {
      roomId, // ⭐ 追加
      deckId: card.deckId,
      cardId: card.id,
      targetPlayerId: card.ownerId,
    });

    client_log("playField", `カード ${card.name} を持ち主 ${card.ownerId} の手札に戻すようリクエスト`);
  };

  return (
    <section
      style={{
        border: "2px dashed #ccc",
        borderRadius: "10px",
        padding: "12px",
        background: "#fafafa",
      }}
    >
      <h3 style={{ marginBottom: "8px" }}>
        プレイエリア
        {name && (
          <span
            style={{
              marginLeft: "10px",
              fontWeight: "normal",
              fontSize: "0.9em",
              color: "#666",
            }}
          >
            （{name}）
          </span>
        )}
      </h3>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", minHeight: "120px" }}>
        {playedCards.length === 0 && <div style={{ opacity: 0.6 }}>（まだカードが出ていません）</div>}
        {playedCards.map((card) => {
          const isFaceUp = true;
          return (
            <div
              key={card.id}
              className={styles.card}
              style={{
                cursor: "pointer",
                position: "relative",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              onDoubleClick={() => returnCardToOwnerHand(card)}
            >
              <CardDisplayContent card={card} isFaceUp={isFaceUp} />
              {card.description && <span className={styles.tooltip}>{card.description}</span>}
            </div>
          );
        })}
      </div>
    </section>
  );
}
