import path from "path";
import { GameServer } from "../src/server.js";
import { cardEffects } from "./data/cardEffects.js";

import mainDeckJson from "./data/cards.json" assert { type: "json" };
import lightDeckJson from "./data/lightCards.json" assert { type: "json" };

const initialDecks = [
  { deckId: "main", name: "イベントカード", cards: mainDeckJson },
  { deckId: "light", name: "光カード", cards: lightDeckJson },
];

const demoServer = new GameServer({
  port: 4000,
  clientDistPath: path.resolve("./tests"),
  libDistPath: path.resolve("../dist"),
  corsOrigins: ["http://localhost:5173", "http://localhost:4000"],
  onServerStart: (url) => {
    console.log(`🎮 Demo server running at: ${url}`);
  },
  initialDecks,
  cardEffects
});

// サーバー起動
demoServer.start();
