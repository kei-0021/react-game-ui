// src/components/PlayField.tsx

import * as React from "react";
import { Socket } from "socket.io-client";
import type { Card } from "../types/card.js";
import type { DeckId, PlayerId, RoomId } from "../types/definition.js";
import type { PlayerWithResources } from "../types/playerWithResources.js";
import { client_log } from "../utils/client-log.js";
import styles from "./Card.module.css";
import "./PlayField.css";

// 通信量制限用の throttle
function throttle<T extends (...args: any[]) => any>(func: T, limit: number) {
  let inThrottle: boolean;
  return function (this: any, ...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

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
  layoutMode?: "grid" | "free"; // 切り替え用
};

export default function PlayField({
  socket,
  roomId,
  deckId,
  name,
  is_logging = false,
  players,
  myPlayerId,
  layoutMode = "free",
}: PlayFieldProps) {
  const [playedCards, setPlayedCards] = React.useState<Card[]>([]);
  // ドラッグ中の表示制御用
  const [activeDraggingId, setActiveDraggingId] = React.useState<string | null>(
    null,
  );
  const containerRef = React.useRef<HTMLDivElement>(null);
  // 座標計算用
  const draggingIdRef = React.useRef<string | null>(null);

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
  }, [socket, roomId, deckId, is_logging, playedCards.length]);

  // リアルタイム送信ロジック
  const emitMove = React.useMemo(
    () =>
      throttle((cardId: string, clientX: number, clientY: number) => {
        if (!containerRef.current) return;

        const rect = containerRef.current.getBoundingClientRect();

        // コンテナ内の相対座標を計算
        let x = ((clientX - rect.left) / rect.width) * 100;
        let y = ((clientY - rect.top) / rect.height) * 100;

        // --- ここで 0% 〜 100% の範囲に制限 ---
        // 0未満なら0、100より大きければ100にする
        x = Math.max(0, Math.min(100, x));
        y = Math.max(0, Math.min(100, y));
        // ------------------------------------

        socket.emit("card:move-on-field", {
          roomId,
          deckId,
          cardId,
          position: { x, y },
        });
      }, 50),
    [socket, roomId, deckId],
  );

  const handlePointerDown = (e: React.PointerEvent, card: Card) => {
    if (layoutMode !== "free") return;
    draggingIdRef.current = card.id;
    setActiveDraggingId(card.id);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!draggingIdRef.current) return;
    emitMove(draggingIdRef.current, e.clientX, e.clientY);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!draggingIdRef.current) return;
    emitMove(draggingIdRef.current, e.clientX, e.clientY);
    (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    draggingIdRef.current = null;
    setActiveDraggingId(null);
  };

  const handleCardBack = (card: Card) => {
    const backTo = card.fieldBackLocation || "discard";
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
    <section className={`rg-playfield mode-${layoutMode}`}>
      <h3 className="rg-playfield-title">
        プレイエリア{" "}
        {name && <span className="rg-playfield-subtitle">（{name}）</span>}
      </h3>
      <div
        ref={containerRef}
        className="rg-playfield-container"
        onPointerMove={handlePointerMove}
        style={{
          position: layoutMode === "free" ? "relative" : undefined,
          minHeight: "600px",
          touchAction: "none",
        }}
      >
        {playedCards.length === 0 && (
          <div className="rg-playfield-empty">（まだカードが出ていません）</div>
        )}
        {playedCards.map((card) => {
          const owner = players.find((p) => p.id === card.ownerId);
          const ownerColor = owner?.color || "#aaaaaa";
          const ownerNameInitial = owner?.name?.[0] || "?";
          const isDragging = activeDraggingId === card.id;

          const freeStyle: React.CSSProperties =
            layoutMode === "free"
              ? {
                  position: "absolute",
                  left: `${card.position?.x ?? 50}%`,
                  top: `${card.position?.y ?? 50}%`,
                  transform: "translate(-50%, -50%)",
                  zIndex: isDragging ? 9999 : Math.floor(card.position?.y ?? 0),
                }
              : {
                  position: undefined,
                  left: undefined,
                  top: undefined,
                  transform: undefined,
                  zIndex: undefined,
                };

          return (
            <div
              key={card.id}
              onPointerDown={(e) => handlePointerDown(e, card)}
              onPointerUp={handlePointerUp}
              className={`${styles.card} rg-playfield-card-wrapper`}
              style={
                {
                  "--owner-color": ownerColor,
                  ...freeStyle,
                  "touchAction": "none",
                  "cursor": isDragging
                    ? "grabbing"
                    : layoutMode === "free"
                      ? "grab"
                      : "default",
                } as React.CSSProperties
              }
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

              {/* ドラッグ中(isDragging)はツールチップを表示しない */}
              {card.description && !isDragging && (
                <span className={styles.tooltip}>{card.description}</span>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
