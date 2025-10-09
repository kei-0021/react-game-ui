import * as React from "react";
import { Socket } from "socket.io-client";
import type { Card } from "../types/card.js";

type PlayFieldProps = {
  socket: Socket;
  deckId: string;
};

export default function PlayField({ socket, deckId }: PlayFieldProps) {
  const [playedCards, setPlayedCards] = React.useState<Card[]>([]);

  React.useEffect(() => {
    const handleUpdate = (data: {
      playFieldCards?: Card[];
    }) => {
      setPlayedCards(data.playFieldCards || []);
    };

    socket.on(`deck:update:${deckId}`, handleUpdate);

    return () => {
      socket.off(`deck:update:${deckId}`, handleUpdate);
    };
  }, [socket, deckId]);

  const playCard = (card: Card) => {
    socket.emit("card:play", {
      deckId: card.deckId,
      cardId: card.id,
      playLocation: "field",
    });
  };

  return (
    <section style={{ border: "2px dashed #ccc", borderRadius: "10px", padding: "12px", margin: "12px 0", background: "#fafafa" }}>
      <h3 style={{ marginBottom: "8px" }}>プレイエリア</h3>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", minHeight: "120px" }}>
        {playedCards.length === 0 && <div style={{ opacity: 0.6 }}>（まだカードが出ていません）</div>}
        {playedCards.map((card) => {
            const isFaceUp = true; // プレイ済みカードは常に表向きにする
            return (
                <div
                key={card.id}
                style={{
                    width: "80px",
                    height: "120px",
                    border: "1px solid #999",
                    borderRadius: "6px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "white",
                    boxShadow: "2px 2px 4px rgba(0,0,0,0.1)",
                    cursor: "pointer",
                    position: "relative",
                }}
                onMouseEnter={e => {
                    const tooltip = e.currentTarget.querySelector(".tooltip") as HTMLElement;
                    if (!tooltip) return;
                    tooltip.style.display = "block";
                }}
                onMouseLeave={e => {
                    const tooltip = e.currentTarget.querySelector(".tooltip") as HTMLElement;
                    if (!tooltip) return;
                    tooltip.style.display = "none";
                }}
                >
                {card.name}
                {card.description && (
                    <span
                    className="tooltip"
                    style={{
                        display: "none",
                        position: "absolute",
                        bottom: "110%",
                        left: "50%",
                        transform: "translateX(-50%)",
                        padding: "6px 10px",
                        background: "#333",
                        color: "white",
                        borderRadius: "4px",
                        whiteSpace: "nowrap",
                        zIndex: 1000,
                        fontSize: "12px",
                    }}
                    >
                    {card.description}
                    </span>
                )}
                </div>
            );
            })}
      </div>
    </section>
  );
}
