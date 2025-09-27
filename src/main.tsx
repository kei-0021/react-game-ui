import { createRoot } from "react-dom/client";
import Dice from "./components/Dice.js";


const rootEl = document.getElementById("root");

if (rootEl) {
  const root = createRoot(rootEl);
  root.render(
    <>
      {/* <Deck cards={allCards} /> */}
      {/* <Scoreboard
        players={playersData}
        sortByScore={true}
        currentPlayerId="p2"
      /> */}
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
