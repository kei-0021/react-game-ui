import path from "path";
import { GameServer } from "../src/server.js";
import { cardEffects } from "./data/cardEffects.js";

import { cellEffects } from "./data/cellEffects.js";
import deepSeaSpeciesActionJson from "./data/deepSeaActionCards.json" assert { type: "json" };
import originalDeepSeaCells from "./data/deepSeaCells.json" assert { type: "json" };
import deepSeaSpeciesDeckJson from "./data/deepSeaSpeciesCards.json" assert { type: "json" };

// -----------------------------------------------------------
// ⭐ 修正箇所: 2セットのカードを作成し、それぞれに一意なIDを割り当てる
// -----------------------------------------------------------

// 1セット分のカードデータ
const originalActionCards = deepSeaSpeciesActionJson;

// 2セット分のカードを生成し、IDを振り直す関数
const createUniqueCards = (cards, setNumber) => {
    return cards.map(card => ({
        ...card,
        // 元のIDにセット番号を追記して一意なIDを作成
        id: `${card.id}-set${setNumber}`,
    }));
};

// 2セット分のカードを生成
const set1 = createUniqueCards(originalActionCards, 1);
const set2 = createUniqueCards(originalActionCards, 2);

// 全てのカードを結合
const deepSeaActionCardsTwoSets = [...set1, ...set2];

// -----------------------------------------------------------

const initialDecks = [
  { deckId: "deepSeaSpecies", name: "深海生物カード", cards: deepSeaSpeciesDeckJson, backColor: "#0d3c99ff" },
    { 
    deckId: "deepSeaAction", 
    name: "アクションカード", 
    cards: deepSeaActionCardsTwoSets, 
    backColor: "#0d8999ff" 
  },
];

const DEEP_SEA_RESOURCES = [
  {
    id: 'OXYGEN',
    name: '酸素',
    icon: '💨',
    currentValue: 50,
    maxValue: 50,
    type: 'CONSUMABLE', 
  },
  {
    id: 'BATTERY',
    name: 'バッテリー',
    icon: '🔋',
    currentValue: 6,
    maxValue: 6,
    type: 'CONSUMABLE',
  },
  {
    id: 'ARTIFACT',
    name: '遺物',
    icon: '💰',
    currentValue: 0,
    maxValue: 100,
    type: 'CONSUMABLE',
  },
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
  initialHand: {
    deckId: "deepSeaAction",
    count: 6
  },
  initialBoard: originalDeepSeaCells,
  cellEffects,
  initialLogCategories: {
    connection: false,
    deck: true,        
  }
});

// サーバー起動
demoServer.start();
