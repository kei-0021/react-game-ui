// src/components/ScoreBoard.tsx
import React from "react";
import { Socket } from "socket.io-client";
import styles from "./Card.module.css"; // カードスタイルがある場合

type Card = {
  id: string;
  name: string;
  description?: string;
};

type Player = {
  id: string;
  name: string;
  score?: number;
  cards?: Card[];
};

type ScoreboardProps = {
  socket: Socket;
  players: Player[];
};

export default function ScoreBoard({ socket, players }: ScoreboardProps) {
  const [currentPlayerId, setCurrentPlayerId] = React.useState<string>("");

  React.useEffect(() => {
    socket.on("game:turn", (playerId: string) => {
      setCurrentPlayerId(playerId);
    });

    return () => {
      socket.off("game:turn");
    };
  }, [socket]);

  const nextTurn = () => {
    socket.emit("game:next-turn");
  };

  // プレイヤーの score/cards を補完
  const displayedPlayers = players.map((p) => ({
    ...p,
    score: p.score ?? 0,
    cards: p.cards ?? [],
  }));

  return (
    <div style={{ padding: "12px", border: "1px solid #ccc", borderRadius: "8px" }}>
      <h2>Scoreboard</h2>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {displayedPlayers.map((player) => (
          <li
            key={player.id}
            style={{
              padding: "6px 12px",
              marginBottom: "6px",
              borderRadius: "4px",
              backgroundColor: player.id === currentPlayerId ? "#a0e7ff" : "#f5f5f5",
              fontWeight: player.id === currentPlayerId ? "bold" : "normal",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>{player.name}</span>
              <span>{player.score}</span>
            </div>

            <div style={{ display: "flex", gap: "6px", marginTop: "6px", flexWrap: "wrap" }}>
              {player.cards.map((card) => (
                <div
                  key={card.id}
                  className={styles.card}
                  style={{ position: "relative", cursor: "pointer" }}
                  onMouseEnter={(e) => {
                    const tooltip = e.currentTarget.querySelector(
                      `.${styles.tooltip}`
                    ) as HTMLElement;
                    if (!tooltip) return;
                    tooltip.style.display = "block";
                  }}
                  onMouseLeave={(e) => {
                    const tooltip = e.currentTarget.querySelector(
                      `.${styles.tooltip}`
                    ) as HTMLElement;
                    if (!tooltip) return;
                    tooltip.style.display = "none";
                  }}
                >
                  {card.name}
                  {card.description && (
                    <span className={styles.tooltip}>{card.description}</span>
                  )}
                </div>
              ))}
            </div>
          </li>
        ))}
      </ul>

      <button onClick={nextTurn}>次のターン</button>
    </div>
  );
}
