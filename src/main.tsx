// src/main.tsx
import { createRoot } from "react-dom/client";
import Scoreboard from "./ScoreBoard.js";

console.log("main.tsx loaded");

const playersData = [
  { id: "p1", name: "Alice", score: 12 },
  { id: "p2", name: "Bob", score: 20 },
  { id: "p3", name: "Charlie", score: 8 },
];

const rootEl = document.getElementById("root");

if (rootEl) {
  const root = createRoot(rootEl);
  root.render(
    <Scoreboard 
        players={playersData}
        sortByScore={true}
        currentPlayerId="p2" // 今のターンのプレイヤーID
    />);
  console.log("Scoreboard rendered");
}
