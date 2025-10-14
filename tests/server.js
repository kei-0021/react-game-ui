import path from "path";
import { GameServer } from "../src/server.js";
import { cardEffects } from "./data/cardEffects.js";

import { cellEffects } from "./data/cellEffects.js";
// 修正: deepSeaCells.json の名前を base に変更
import deepSeaActionCardsBaseJson from "./data/deepSeaActionCards.json" assert { type: "json" };
import deepSeaCellsBaseJson from "./data/deepSeaCells.json" assert { type: "json" };
import deepSeaSpeciesDeckJson from "./data/deepSeaSpeciesCards.json" assert { type: "json" };

// -----------------------------------------------------------
// ⭐ ボードセル生成に必要な枚数を server.js で定義 (合計 64枚)
// -----------------------------------------------------------

const CELL_COUNTS = {
    RA: 5, // 遺物（古代遺物）
    RB: 10, // 遺物（技術部品）
    B_NORM: 4, // 危険生物（通常）
    B_TRACK: 3, // 危険生物（追跡型）
    T_VOL: 7, // 特殊地形（火山）
    T_CRF: 6, // 特殊地形（珊瑚礁）
    N_A: 12, // 通常地形（深海A）
    N_B: 17, // 通常地形（深海B）
}; 

// -----------------------------------------------------------
// ⭐ ボードの次元を設定
// -----------------------------------------------------------

const ROWS = 8;
const COLS = 8;

// -----------------------------------------------------------
// ⭐ アクションカード: 3セット (合計 18枚) を生成するロジック
// -----------------------------------------------------------

const originalActionCards = deepSeaActionCardsBaseJson;

/**
 * ベースカードデータから指定セット数分を複製し、ユニークなIDを割り当てる
 * @param {Array} cards - ベースとなるカード配列
 * @param {number} numSets - 生成するセット数 (プレイヤー数)
 * @returns {Array} 全カードの配列
 */
const createUniqueCards = (cards, numSets) => {
    const allCards = [];
    for (let i = 1; i <= numSets; i++) {
        cards.forEach(card => {
            allCards.push({
                ...card,
                id: `${card.id}-set${i}`,
            });
        });
    }
    return allCards;
};

// 3セット分のカード（合計18枚）を生成
const deepSeaActionCardsThreeSets = createUniqueCards(originalActionCards, 3);

// -----------------------------------------------------------
// ⭐ ボードセル: ベース定義とCELL_COUNTSから64枚のタイルを生成する (1次元配列として)
// -----------------------------------------------------------

/**
 * ベースのセルテンプレートと枚数定義に基づき、ユニークなタイルを生成する
 * @param {Array} baseCells - セルテンプレートの配列
 * @param {Object} counts - テンプレートIDごとの生成枚数
 * @returns {Array} 64枚のユニークなボードセルの配列 (1次元)
 */
const createBoardCells = (baseCells, counts) => {
    const finalCells = [];
    let tileCount = 0;
    
    // テンプレート配列から対応するテンプレートを見つけるためのマップを作成
    const templateMap = baseCells.reduce((map, template) => {
        map[template.templateId] = template;
        return map;
    }, {});

    // CELL_COUNTSに定義された枚数でタイルを生成
    for (const templateId in counts) {
        const template = templateMap[templateId];
        const count = counts[templateId];

        if (!template) {
            console.error(`ERROR: Template ID ${templateId} not found in baseCells.`);
            continue;
        }
        
        // 指定された枚数だけタイルを複製
        for (let i = 1; i <= count; i++) {
            finalCells.push({
                // idをユニークにし、templateIdを保持
                id: `${templateId}-${i}`,
                templateId: templateId, 
                name: template.name,
                shapeType: template.shapeType,
                backgroundColor: template.backgroundColor,
                content: template.content,
                changedContent: template.changedContent,
                customClip: template.customClip,
                changedColor: template.changedColor,
            });
            tileCount++;
        }
    }

    if (tileCount !== 64) {
        console.error(`ERROR: Total tiles generated (${tileCount}) does not equal 64.`);
    } else {
        console.log(`✅ Deep Sea Cells: Total ${tileCount} tiles generated.`);
    }
    
    return finalCells;
};

// 64枚のタイルを生成 (1次元配列)
const completeDeepSeaCells1D = createBoardCells(deepSeaCellsBaseJson, CELL_COUNTS);


// -----------------------------------------------------------
// ⭐ 1次元配列を2次元配列 (8x8) に変換するロジック
// -----------------------------------------------------------

/**
 * 1次元配列のセルを2次元配列 (Rows x Cols) に変換する
 * @param {Array} cells1D - 1次元配列のセルデータ
 * @param {number} rows - 行数
 * @param {number} cols - 列数
 * @returns {Array<Array>} 2次元配列のボードデータ
 */
const convertCellsTo2D = (cells1D, rows, cols) => {
    const cells2D = [];
    if (cells1D.length !== rows * cols) {
        console.error(`ERROR: Cell count mismatch for 2D conversion. Expected ${rows * cols}, got ${cells1D.length}.`);
        return [[]];
    }

    // 1次元配列をcolsの長さで区切って行として2次元配列に追加
    for (let r = 0; r < rows; r++) {
        const row = cells1D.slice(r * cols, (r + 1) * cols);
        cells2D.push(row);
    }
    return cells2D;
};


// 64枚のタイルを8x8の2次元配列に変換
const completeDeepSeaCells2D = convertCellsTo2D(completeDeepSeaCells1D, ROWS, COLS);

// -----------------------------------------------------------
// ⭐ ゲームリソース定義
// -----------------------------------------------------------

const DEEP_SEA_RESOURCES = [
  {
    id: 'OXYGEN',
    name: '酸素',
    icon: '🫧',
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
];

// -----------------------------------------------------------
// ⭐ [新規] トークンテンプレートと生成ヘルパー
// -----------------------------------------------------------

const DEEP_SEA_TOKENS_ARTIFACT = [
  {
    id: 'ARTIFACT',
    name: '💰',
    color: '#D4AF37', // Gold color for store display
  },
];

/**
 * トークンテンプレートから指定された枚数分のトークンを生成し、ユニークなIDを割り当てる
 * @param {Array} templates - トークンテンプレートの配列
 * @returns {Array} 生成されたすべてのトークン（1次元配列）
 */
const createUniqueTokens = (templates, counts) => {
    const allTokens = [];
    
    templates.forEach(template => {
        for (let i = 1; i <= counts; i++) {
            // トークンオブジェクトは、プレイヤーに渡されたときに count プロパティが使われるため、
            // ストアの個別のトークンには count を含めず、代わりに isAvailable: true などで管理する
            // ここではシンプルに、同じ構造を複製し、ユニークなIDを持たせる
            allTokens.push({
                ...template,
                // ストア内の各トークンはユニークなIDを持つ
                id: `${template.id}-${i}`, 
                templateId: template.id, // 種類を識別するためのID
            });
        }
    });
    
    console.log(`✅ Token Store: Total ${allTokens.length} individual tokens generated.`);
    return allTokens;
};

// サーバー起動時にストアに配置されるトークン
const initTokenStores = [
  {
    tokenStoreId: "ARTIFACT",
    name: "遺物",
    tokens: createUniqueTokens(DEEP_SEA_TOKENS_ARTIFACT, 10)
  },
]

// -----------------------------------------------------------
// ⭐ デッキ定義
// -----------------------------------------------------------

const initialDecks = [
  { 
    deckId: "deepSeaSpecies",
    name: "深海生物カード",
    cards: deepSeaSpeciesDeckJson,
    backColor: "#0d3c99ff"
  },
  { 
    deckId: "deepSeaAction", 
    name: "アクションカード", 
    cards: deepSeaActionCardsThreeSets, // 3セット18枚を設定
    backColor: "#0d8999ff" 
  },
];

// -----------------------------------------------------------
// ⭐ GameServer 初期化
// -----------------------------------------------------------

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
  initialTokenStore: initTokenStores, // ⭐ [修正] 個別のトークン配列を設定
  initialHand: {
    deckId: "deepSeaAction",
    count: 6 // 各プレイヤーに6枚のカードが初期手札として配られる
  },
  initialBoard: completeDeepSeaCells2D, // ⭐ 2次元配列を設定
  cellEffects,
  initialLogCategories: {
    connection: false,
    deck: true,        
  }
});

// サーバー起動
demoServer.start();
