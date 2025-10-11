import path from "path";
import { GameServer } from "../src/server.js";
import { cardEffects } from "./data/cardEffects.js";

import fantasyDeckJson from "./data/fantasyCards.json" assert { type: "json" };
import numberDeckJson from "./data/numberCards.json" assert { type: "json" };

const initialDecks = [
  { deckId: "fantasy", name: "ファンタジーカード", cards: fantasyDeckJson, backColor: "#c25656ff" },
  { deckId: "number", name: "数字カード", cards: numberDeckJson, backColor: "#7e6d36ff" },
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
