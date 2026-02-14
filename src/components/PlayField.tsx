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
    return null;
  }

  if (card.frontImage) {
    return (
      <img src={card.frontImage} alt={card.name} className="rg-card-image" />
    );
  }

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
  layoutMode?: "grid" | "free";
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
  const [activeDraggingId, setActiveDraggingId] = React.useState<string | null>(
    null,
  );
  const containerRef = React.useRef<HTMLDivElement>(null);
  const draggingIdRef = React.useRef<string | null>(null);

  React.useEffect(() => {
    const handleUpdate = (data: { playFieldCards?: Card[] }) => {
      const newCards = data.playFieldCards || [];
      if (is_logging) {
        client_log("playField", `[${deckId}] 場の更新: ${newCards.length}枚`);
      }
      setPlayedCards(newCards);
    };

    socket.on(`deck:update:${roomId}:${deckId}`, handleUpdate);
    return () => {
      socket.off(`deck:update:${roomId}:${deckId}`, handleUpdate);
    };
  }, [socket, roomId, deckId, is_logging]);

  // リアルタイム送信ロジック（境界制限付き）
  const emitMove = React.useMemo(
    () =>
      throttle((cardId: string, clientX: number, clientY: number) => {
        if (!containerRef.current) return;

        const rect = containerRef.current.getBoundingClientRect();

        // 座標計算 & 0-100% の範囲にクランプ
        let x = ((clientX - rect.left) / rect.width) * 100;
        let y = ((clientY - rect.top) / rect.height) * 100;

        x = Math.max(0, Math.min(100, x));
        y = Math.max(0, Math.min(100, y));

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
      if (!card.ownerId) return;
      requestData.targetPlayerId = card.ownerId;
    }

    socket.emit("card:move-from-field", requestData);
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
          overflow: "hidden", // 枠外はみ出し防止
        }}
      >
        {playedCards.length === 0 && (
          <div className="rg-playfield-empty">（まだカードが出ていません）</div>
        )}
        {playedCards.map((card, index) => {
          const owner = players.find((p) => p.id === card.ownerId);
          const isDragging = activeDraggingId === card.id;

          // --- 自動回避（オフセット）ロジック ---
          // 他のカードと座標が重なっているか判定（誤差1%以内）
          const isOverlapping = playedCards
            .slice(0, index)
            .some(
              (other) =>
                Math.abs((other.position?.x ?? 50) - (card.position?.x ?? 50)) <
                  1 &&
                Math.abs((other.position?.y ?? 50) - (card.position?.y ?? 50)) <
                  1,
            );
          // 重なりがある場合、indexに応じて階段状にずらす
          const visualOffset = isOverlapping ? index * 12 : 0;

          const freeStyle: React.CSSProperties =
            layoutMode === "free"
              ? {
                  position: "absolute",
                  left: `${card.position?.x ?? 50}%`,
                  top: `${card.position?.y ?? 50}%`,
                  // transform内でオフセットを適用
                  transform: `translate(calc(-50% + ${visualOffset}px), calc(-50% + ${visualOffset}px))`,
                  zIndex: isDragging
                    ? 9999
                    : Math.floor((card.position?.y ?? 0) * 100) + index,
                }
              : {};

          return (
            <div
              key={card.id}
              onPointerDown={(e) => handlePointerDown(e, card)}
              onPointerUp={handlePointerUp}
              className={`${styles.card} rg-playfield-card-wrapper`}
              style={
                {
                  "--owner-color": owner?.color || "#aaaaaa",
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
                  {owner?.name?.[0] || "?"}
                </div>
              )}

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
