// src/App.tsx
import React from "react";
import Deck from "../src/components/Deck.js";
import Dice from "../src/components/Dice.js";
import PlayField from "../src/components/PlayField.js";
import ScoreBoard from "../src/components/ScoreBoard.js";
import Timer from "../src/components/Timer.js";
import { useSocket } from "../src/hooks/useSocket.js";
import type { Player } from "../src/types/player.js";

export default function App() {
  const socket = useSocket("http://127.0.0.1:4000");
  const [myPlayerId, setMyPlayerId] = React.useState<string | null>(null);
  const [players, setPlayers] = React.useState<Player[]>([]);
  const [currentPlayerId, setCurrentPlayerId] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!socket) return;

    socket.on("player:assign-id", setMyPlayerId);
    socket.on("players:update", setPlayers);
    socket.on("game:turn", setCurrentPlayerId);

    return () => {
      socket.off("player:assign-id");
      socket.off("players:update");
      socket.off("game:turn");
    };
  }, [socket]);

  if (!socket) return <p>接続中…</p>;

  return (
    <div>
      <Deck socket={socket} deckId="fantasy" name="ファンタジーカード" playerId={currentPlayerId} />
      <Deck socket={socket} deckId="number" name="数字カード" playerId={currentPlayerId} />

      <PlayField socket={socket} deckId="fantasy"/>
      <PlayField socket={socket} deckId="number"/>

      <Dice socket={socket} diceId="0" sides={6} />
      <Dice socket={socket} diceId="1" sides={2} />

      <Timer socket={socket} onFinish={() => console.log("タイマー終了！")} />
      <ScoreBoard
        socket={socket}
        players={players}
        currentPlayerId={currentPlayerId}
        myPlayerId={myPlayerId}
      />
    </div>
  );
}
