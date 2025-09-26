import React from "react";
import ReactDOM from "react-dom/client";
import DiceSocket from "./components/Dice.js";
import Timer from "./components/Timer.js"; // Socket対応Timer
import { useDeck, useSocket } from "./hooks/index.js";

export default function Game() {
  const socket = useSocket("http://127.0.0.1:3000");
  const { deck, drawnCards, draw, shuffle } = useDeck(socket!);

  if (!socket) return <p>接続中…</p>;

  return (
    <div>
      <button onClick={draw}>カードを引く</button>
      <button onClick={shuffle}>シャッフル</button>
      <div>引いたカード: {drawnCards.map(c => c.name).join(", ")}</div>

      <DiceSocket socket={socket} sides={6} />

      {/* Socket対応Timer */}
      <Timer
        socket={socket}
        onFinish={() => console.log("タイマー終了！")}
      />
    </div>
  );
}

// マウント
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Game />
  </React.StrictMode>
);
