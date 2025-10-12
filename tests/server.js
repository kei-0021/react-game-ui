import path from "path";
import { GameServer } from "../src/server.js";
import { cardEffects } from "./data/cardEffects.js";

// import fantasyDeckJson from "./data/fantasyCards.json" assert { type: "json" };
// import numberDeckJson from "./data/numberCards.json" assert { type: "json" };
import deepSeaDeckJson from "./data/deepSeaCards.json" assert { type: "json" };
// ⭐ 追加: deepSeaCells.json をインポート
import { cellEffects } from "./data/cellEffects.js";
import originalDeepSeaCells from "./data/deepSeaCells.json" assert { type: "json" };

const initialDecks = [
  // { deckId: "fantasy", name: "ファンタジーカード", cards: fantasyDeckJson, backColor: "#c25656ff" },
  // { deckId: "number", name: "数字カード", cards: numberDeckJson, backColor: "#7e6d36ff" },
  { deckId: "deepSea", name: "深海カード", cards: deepSeaDeckJson, backColor: "#0d3c99ff" },
];

const DEEP_SEA_RESOURCES = [
  {
    id: 'OXYGEN',
    name: '酸素',
    icon: '💨',
    currentValue: 40,
    maxValue: 100,
    type: 'CONSUMABLE', 
  },
  {
    id: 'BATTERY',
    name: 'バッテリー',
    icon: '🔋',
    currentValue: 50,
    maxValue: 50,
    type: 'CONSUMABLE',
  }
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
  cardEffects,
  initialResources: DEEP_SEA_RESOURCES,
  // ⭐ 修正: 読み込んだ盤面データを initialBoard に渡す
  initialBoard: originalDeepSeaCells,
  cellEffects,
  initialLogCategories: {
    connection: false,
    deck: false,        
  }
});

// サーバー起動
demoServer.start();
