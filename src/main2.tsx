// src/main2.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import Deck from "./components/Deck.js";
import DiceSocket from "./components/Dice.js";
import ScoreBoard from "./components/ScoreBoard.js";
import Timer from "./components/Timer.js";
import { useSocket } from "./hooks/index.js";

type Player = {
  id: string;
  name: string;
  score: number;
};

export default function Game() {
  const socket = useSocket("http://127.0.0.1:3000");
  const [players, setPlayers] = React.useState<Player[]>([]);
  const [currentPlayerId, setCurrentPlayerId] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!socket) return;

    // 現在ターン
    socket.on("game:turn", (playerId: string) => {
      setCurrentPlayerId(playerId);
    });

    // プレイヤーリスト更新
    socket.on("players:update", (playerList: Player[]) => {
      setPlayers(playerList);
    });

    return () => {
      socket.off("game:turn");
      socket.off("players:update");
    };
  }, [socket]);

  if (!socket) return <p>接続中…</p>;

  return (
    <div>
      <Deck socket={socket} playerId={currentPlayerId} />

      <DiceSocket socket={socket} sides={6} />

      <Timer
        socket={socket}
        onFinish={() => console.log("タイマー終了！")}
      />

      <ScoreBoard
        socket={socket}
        players={players}
        currentPlayerId={currentPlayerId}
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
