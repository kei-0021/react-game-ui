// src/components/ScoreBoard.tsx
import { Card as CardType } from "./Card.js";
import styles from "./Card.module.css";

type Player = {
  id: string;
  name: string;
  score: number;
  cards?: CardType[];
};

type ScoreboardProps = {
  players: Player[];
  title?: string;
  maxWidth?: string;
  highlightTop?: number;
  currentPlayerId?: string;
  sortByScore?: boolean;
};

export default function Scoreboard({
  players,
  title = "Scoreboard",
  maxWidth = "400px",
  highlightTop = 3,
  currentPlayerId,
  sortByScore = true,
}: ScoreboardProps) {
  const displayedPlayers = sortByScore
    ? [...players].sort((a, b) => b.score - a.score)
    : [...players];

  return (
    <div
      style={{
        maxWidth,
        backgroundColor: "#fff",
        borderRadius: "12px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        padding: "16px",
      }}
    >
      <h2
        style={{
          fontSize: "1.5rem",
          fontWeight: "bold",
          marginBottom: "12px",
        }}
      >
        {title}
      </h2>

      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {displayedPlayers.map((player, index) => {
          const isTop = sortByScore && index < highlightTop;
          const isCurrent = player.id === currentPlayerId;

          return (
            <li
              key={player.id}
              style={{
                display: "flex",
                flexDirection: "column",
                padding: "8px 12px",
                marginBottom: "12px",
                borderRadius: "8px",
                backgroundColor: isCurrent
                  ? "#a0e7ff"
                  : isTop
                  ? "#d3d3d3"
                  : "#f5f5f5",
                fontWeight: isCurrent || isTop ? "bold" : "normal",
                transition: "background-color 0.3s ease",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>{player.name}</span>
                <span>{player.score}</span>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "6px",
                  marginTop: "6px",
                  flexWrap: "wrap",
                }}
              >
                {player.cards?.map((card) => (
                  <div
                    key={card.id}
                    className={styles.card}
                    onMouseEnter={(e) => {
                      const tooltip = e.currentTarget.querySelector(
                        `.${styles.tooltip}`
                      ) as HTMLElement;
                      if (!tooltip) return;

                      const rect = tooltip.getBoundingClientRect();

                      // 右端補正
                      const offsetRight = rect.right - window.innerWidth;
                      if (offsetRight > 0) {
                        tooltip.style.transform = `translateX(calc(-50% - ${offsetRight}px))`;
                      }

                      // 左端補正
                      const offsetLeft = rect.left;
                      if (offsetLeft < 0) {
                        tooltip.style.transform = `translateX(calc(-50% + ${-offsetLeft}px))`;
                      }

                      // 上端補正
                      if (rect.top < 0) {
                        tooltip.style.bottom = "";
                        tooltip.style.top = "120%";
                      }
                    }}
                    onMouseLeave={(e) => {
                      const tooltip = e.currentTarget.querySelector(
                        `.${styles.tooltip}`
                      ) as HTMLElement;
                      if (!tooltip) return;
                      tooltip.style.transform = "translateX(-50%)";
                      tooltip.style.bottom = "120%";
                      tooltip.style.top = "";
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
          );
        })}
      </ul>
    </div>
  );
}
