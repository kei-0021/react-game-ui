import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import Deck from "./components/Deck.js";
import DiceSocket from "./components/Dice.js";
import ScoreBoard from "./components/ScoreBoard.js";
import Timer from "./components/Timer.js";
import { useSocket } from "./hooks/index.js";

export default function Game() {
  const socket = useSocket("http://127.0.0.1:3000");
  const [players, setPlayers] = useState([]); // ここで状態管理
  const [scores, setScores] = useState({});

  useEffect(() => {
    if (!socket) return;

    // プレイヤー情報受信
    socket.on("players:update", (playersData) => {
      setPlayers(playersData);
    });

    // コンポーネントアンマウント時にクリーンアップ
    return () => {
      socket.off("players:update");
      socket.off("score:update");
    };
  }, [socket]);

  if (!socket) return <p>接続中…</p>;

  return (
    <div>
      <Deck socket={socket} />
      <DiceSocket socket={socket} sides={6} />
      <Timer socket={socket} onFinish={() => console.log("タイマー終了！")} />
      <ScoreBoard socket={socket} players={players}/>
    </div>
  );
}

// マウント
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Game />
  </React.StrictMode>
);
