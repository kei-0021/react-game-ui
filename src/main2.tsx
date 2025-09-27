import React from "react";
import ReactDOM from "react-dom/client";
import Deck from "./components/Deck.js";
import DiceSocket from "./components/Dice.js";
import ScoreBoard from "./components/ScoreBoard.js";
import Timer from "./components/Timer.js";
import { cardEffects } from "./data/cardEffects.js";
import mainDeck from "./data/cards.json";
import lightDeck from "./data/lightCards.json";
import { useSocket } from "./hooks/useSocket.js";
import { Player } from "./types/player.js";

export default function Game() {
  const socket = useSocket("http://127.0.0.1:3000");
  const [players, setPlayers] = React.useState<Player[]>([]);
  const [currentPlayerId, setCurrentPlayerId] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!socket) return;

    // プレイヤー情報
    socket.on("players:update", setPlayers);
    socket.on("game:turn", setCurrentPlayerId);

    // 初期デッキ送信
    const allDecks = [
      { deckId: "main", name: "イベントカード", cards: mainDeck },
      { deckId: "light", name: "光カード", cards: lightDeck }
    ];

    allDecks.forEach(deck => {
      deck.cards = deck.cards.map(c => ({
        ...c,
        onPlay: cardEffects[c.name] || (() => {}),
        location: "deck"
      }));
      socket.emit("deck:add", deck);
    });

    allDecks.forEach(deck => socket.emit("deck:add", deck));

    return () => {
      socket.off("players:update");
      socket.off("game:turn");
    };
  }, [socket]);

  if (!socket) return <p>接続中…</p>;

  return (
    <div>
      <Deck socket={socket} deckId="main" name="イベントカード" playerId={currentPlayerId} />
      <Deck socket={socket} deckId="light" name="光カード" playerId={currentPlayerId} />

      <DiceSocket socket={socket} diceId="0" sides={6} />
      <DiceSocket socket={socket} diceId="1" sides={2} />

      <Timer socket={socket} onFinish={() => console.log("タイマー終了！")} />
      <ScoreBoard socket={socket} players={players} currentPlayerId={currentPlayerId} />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Game />
  </React.StrictMode>
);
