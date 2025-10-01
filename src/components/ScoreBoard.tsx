// src/components/ScoreBoard.tsx
import { Socket } from "socket.io-client";
import { Card } from "../types/card.js";
import { Player, PlayerId } from "../types/player.js";
import styles from "./Card.module.css";

type ScoreboardProps = {
  socket: Socket;
  players: Player[];
  currentPlayerId?: PlayerId | null;
  myPlayerId: PlayerId | null;
};

export default function ScoreBoard({ socket, players, currentPlayerId, myPlayerId}: ScoreboardProps) {
  const nextTurn = () => socket.emit("game:next-turn");

  // プレイヤーの初期化（cards が undefined の場合は空配列にする）
  const displayedPlayers = players.map(p => ({
    ...p,
    score: p.score ?? 0,
    cards: p.cards ?? [],
  }));

  return (
    <div style={{ padding: "12px", border: "1px solid #ccc", borderRadius: "8px" }}>
      <h2>Scoreboard</h2>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {displayedPlayers.map(player => (
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
              <span>
                {player.id === myPlayerId && "⭐️"} {player.name}
              </span>
              <span>{player.score}</span>
            </div>

            <div style={{ display: "flex", gap: "6px", marginTop: "6px", flexWrap: "wrap" }}>
              {player.cards.map((card: Card) => {
                // カードが表向き or ターンプレイヤーなら表
                const isFaceUp = card.isFaceUp && player.id === myPlayerId;

                return (
                  <div
                    key={card.id}
                    className={isFaceUp ? styles.card : styles.cardBack}
                    style={{ position: "relative", cursor: "pointer", width: "60px", height: "80px" }}
                    onMouseEnter={e => {
                      if (!isFaceUp) return;
                      const tooltip = e.currentTarget.querySelector(`.${styles.tooltip}`) as HTMLElement;
                      if (!tooltip) return;
                      tooltip.style.display = "block";
                    }}
                    onMouseLeave={e => {
                      if (!isFaceUp) return;
                      const tooltip = e.currentTarget.querySelector(`.${styles.tooltip}`) as HTMLElement;
                      if (!tooltip) return;
                      tooltip.style.display = "none";
                    }}
                    onClick={() => {
                      if (!isFaceUp) return;
                      socket.emit("card:play", { deckId: card.deckId, cardId: card.id, playerId: player.id });
                    }}
                  >
                    {isFaceUp && card.name}
                    {isFaceUp && card.description && <span className={styles.tooltip}>{card.description}</span>}
                  </div>
                );
              })}
            </div>
          </li>
        ))}
      </ul>

      <button onClick={nextTurn}>次のターン</button>
    </div>
  );
}
