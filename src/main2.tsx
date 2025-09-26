import React from "react";
import ReactDOM from "react-dom/client";
import DiceSocket from "./components/Dice.js";
import { useDeck, useSocket, useTimer } from "./hooks/index.js";

export default function Game() {
  const socket = useSocket("http://127.0.0.1:3000");
  const { deck, drawnCards, draw, shuffle } = useDeck(socket!);
  const { timeLeft, start } = useTimer(socket!);

  if (!socket) return <p>接続中…</p>; // ←ここを追加

  return (
    <div>
      <button onClick={draw}>カードを引く</button>
      <button onClick={shuffle}>シャッフル</button>
      <div>引いたカード: {drawnCards.map(c => c.name).join(", ")}</div>

      <DiceSocket socket={socket} sides={6} />

      <button onClick={() => start(30)}>30秒タイマー</button>
      {timeLeft !== null && <p>残り時間: {timeLeft}</p>}
    </div>
  );
}


// ここでマウントする
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Game />
  </React.StrictMode>
);
