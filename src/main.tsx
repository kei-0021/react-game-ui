// src/main.tsx
import { createRoot } from "react-dom/client";
import Scoreboard from "./ScoreBoard.js";

console.log("main.tsx loaded");

const playersData = [
  { 
    id: "p1",
    name: "Alice", 
    score: 12, 
    cards: [
      { id: "1", name: "1", description: "このカードを使うと1マス進める" },
      { id: "2", name: "2", description: "このカードを使うと2マス進める" }] 
  },
  { id: "p2", name: "Bob", score: 20, cards: [] },
  { id: "p3", name: "Charlie", score: 8, cards: [] },
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
