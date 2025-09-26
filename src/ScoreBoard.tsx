type Player = {
  id: string;
  name: string;
  score: number;
};

type ScoreboardProps = {
  players: Player[];
  title?: string;
  maxWidth?: string;
  highlightTop?: number;
  currentPlayerId?: string;
  sortByScore?: boolean; // 追加
};

export default function Scoreboard({
  players,
  title = "Scoreboard",
  maxWidth = "400px",
  highlightTop = 3,
  currentPlayerId,
  sortByScore = true, // デフォルトでスコア順
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
      <h2 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "12px" }}>
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
                justifyContent: "space-between",
                padding: "8px 12px",
                marginBottom: "6px",
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
              <span>{player.name}</span>
              <span>{player.score}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
