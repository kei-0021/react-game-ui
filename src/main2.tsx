import React from "react";
import ReactDOM from "react-dom/client";
import Deck from "./components/Deck.js";
import DiceSocket from "./components/Dice.js";
import Timer from "./components/Timer.js"; // Socket対応Timer
import { useSocket } from "./hooks/index.js";

export default function Game() {
  const socket = useSocket("http://127.0.0.1:3000");

  if (!socket) return <p>接続中…</p>;

  return (
    <div>
      <Deck socket={socket} />

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
