// src/App.tsx
import React from "react";
import Deck from "../src/components/Deck.js";
import Dice from "../src/components/Dice.js";
import ScoreBoard from "../src/components/ScoreBoard.js";
import Timer from "../src/components/Timer.js";
import { cardEffects } from "../src/data/cardEffects.js";
import mainDeckJson from "../src/data/cards.json";
import lightDeckJson from "../src/data/lightCards.json";
import { useSocket } from "../src/hooks/useSocket.js";
import type { Card } from "../src/types/card.js";
import type { Player } from "../src/types/player.js";

const mainDeck: Card[] = mainDeckJson as Card[];
const lightDeck: Card[] = lightDeckJson as Card[];

export default function App() {
  const socket = useSocket("http://127.0.0.1:3000");
  const [myPlayerId, setMyPlayerId] = React.useState<string | null>(null);
  const [players, setPlayers] = React.useState<Player[]>([]);
  const [currentPlayerId, setCurrentPlayerId] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!socket) return;

    socket.on("player:assign-id", setMyPlayerId);
    socket.on("players:update", setPlayers);
    socket.on("game:turn", setCurrentPlayerId);

    const allDecks = [
      { deckId: "main", name: "イベントカード", cards: mainDeck },
      { deckId: "light", name: "光カード", cards: lightDeck },
    ];

    allDecks.forEach(deck => {
      deck.cards = deck.cards.map(c => ({
        ...c,
        onPlay: cardEffects[c.name] || (() => {}),
        location: "deck",
      }));
      socket.emit("deck:add", deck);
    });

    return () => {
      socket.off("player:assign-id");
      socket.off("players:update");
      socket.off("game:turn");
    };
  }, [socket]);

  if (!socket) return <p>接続中…</p>;

  return (
    <div>
      <Deck socket={socket} deckId="main" name="イベントカード" playerId={currentPlayerId} />
      <Deck socket={socket} deckId="light" name="光カード" playerId={currentPlayerId} />

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
