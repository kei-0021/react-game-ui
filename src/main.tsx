import { createRoot } from "react-dom/client";
import { default as Deck } from "./components/Deck.js"; // Deck クラス
import Dice from "./components/Dice.js";
import Scoreboard from "./components/ScoreBoard.js";

import allCards from "./data/cards.json";
import playersData from "./data/players.json";

const rootEl = document.getElementById("root");

if (rootEl) {
  const root = createRoot(rootEl);
  root.render(
    <>
      <Deck cards={allCards} />
      <Scoreboard
        players={playersData}
        sortByScore={true}
        currentPlayerId="p2"
      />
      <Dice sides={2} />
      {/* <Timer
        initialTime={10}
        onFinish={() => {
          console.log("タイムアップ！");
        }}
      /> */}
    </>
  );
}
