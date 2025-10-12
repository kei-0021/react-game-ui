// src/App.tsx (修正後)

import React from "react";
import Deck from "../src/components/Deck.js";
import PlayField from "../src/components/PlayField.js";
import ScoreBoard from "../src/components/ScoreBoard.js";
import { useSocket } from "../src/hooks/useSocket.js";
import type { Player } from "../src/types/player.js";
import type { Resource } from "../src/types/resource.js"; // ⭐ Resource 型をインポート
import MyBoard from "./MyBoard.js";

// ⭐ 抽象的な Player 型にリソース情報が付加されていることを示す型を定義
// サーバーから送られてくる Player データは、リソース情報を含むものと想定
type PlayerWithResources = Player & { resources: Resource[] };


export default function App() {
  const socket = useSocket("http://127.0.0.1:4000");
  const [myPlayerId, setMyPlayerId] = React.useState<string | null>(null);
  
  // ⭐ 状態管理の型を PlayerWithResources[] に変更
  const [players, setPlayers] = React.useState<PlayerWithResources[]>([]); 
  
  const [currentPlayerId, setCurrentPlayerId] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!socket) return;

    socket.on("player:assign-id", setMyPlayerId);
    
    // ⭐ socket.onで受け取るデータも PlayerWithResources[] 型であることを宣言
    // サーバーがこの型でデータを送ることを前提とする
    socket.on("players:update", (updatedPlayers: PlayerWithResources[]) => {
      setPlayers(updatedPlayers);
    });
    
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

      <PlayField socket={socket} deckId="fantasy" name="ファンタジーカード" is_logging={true}/>
      <PlayField socket={socket} deckId="number" name="数字カード"/>

      {/* <Dice socket={socket} diceId="0" sides={6} /> */}
      {/* <Dice socket={socket} diceId="1" sides={2} /> */}

      {/* <Timer socket={socket} onFinish={() => console.log("タイマー終了！")} /> */}
      <ScoreBoard
        socket={socket}
        players={players} // ⭐ PlayerWithResources[] 型のデータが渡される
        currentPlayerId={currentPlayerId}
        myPlayerId={myPlayerId}
      />
      <MyBoard 
        socket={socket}
        myPlayerId={myPlayerId}
      />
    </div>
  );
}
