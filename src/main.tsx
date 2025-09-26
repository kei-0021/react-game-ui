// src/main.tsx
import { createRoot } from "react-dom/client";
import Scoreboard from "./ScoreBoard.js";
import playersData from "./data/players.json";

const rootEl = document.getElementById("root");

if (rootEl) {
  const root = createRoot(rootEl);
  root.render(
    <Scoreboard 
      players={playersData}
      sortByScore={true}
      currentPlayerId="p2"
    />
  );
}
