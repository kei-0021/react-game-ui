import * as fs from 'fs/promises';
import path from 'path';
import { GameServer, type GameServerOptions } from 'react-game-ui/server';
import { fileURLToPath } from 'url';

// @ts-ignore
import { cardEffects } from './data/cardEffects.js';
// @ts-ignore
import { cellEffects } from './data/cellEffects.js';
// @ts-ignore
import { Card } from '../src/types/card.js';
import { GameId, RoomParam, RoomState } from '../src/types/server.js';
import { customEvents } from './data/customEvents.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * 外部JSONファイルを非同期で読み込み、パースするヘルパー関数
 */
async function loadJson<T>(relativePath: string): Promise<T> {
  const jsonPath = path.join(__dirname, relativePath);
  try {
    const data = await fs.readFile(jsonPath, 'utf-8');
    return JSON.parse(data) as T;
  } catch (error) {
    console.error(`Error loading JSON file: ${relativePath}`, error);
    throw new Error(`Failed to load critical data from ${relativePath}`);
  }
}

// --- メインサーバー起動ロジック ---
async function startServer() {
  // 複数のJSONファイルを並行してロード
  const [numberCardsJson, deepSeaActionCardsBaseJson, deepSeaCellsBaseJson, deepSeaSpeciesDeckJson] = await Promise.all(
    [
      loadJson<Card[]>('./data/numberCards.json'),
      loadJson<Card[]>('./data/deepSeaActionCards.json'),
      loadJson<any[]>('./data/deepSeaCells.json'),
      loadJson<Card[]>('./data/deepSeaSpeciesCards.json'),
    ],
  );

  // --- カード・セルの生成用ヘルパー ---
  const CELL_COUNTS = {
    RA: 5,
    RB: 10,
    B_NORM: 4,
    B_TRACK: 3,
    T_VOL: 7,
    T_CRF: 6,
    N_A: 12,
    N_B: 17,
  };
  const ROWS = 8;
  const COLS = 8;

  const createUniqueCards = (cards: Card[], numSets: number): Card[] => {
    const allCards: Card[] = [];
    for (let i = 1; i <= numSets; i++) {
      cards.forEach((card) => allCards.push({ ...card, id: `${card.id}-set${i}` }));
    }
    return allCards;
  };

  const createBoardCells = (baseCells: any[], counts: Record<string, number>) => {
    const templateMap = baseCells.reduce(
      (map, t) => {
        map[t.templateId] = t;
        return map;
      },
      {} as Record<string, any>,
    );

    const finalCells: any[] = [];
    for (const templateId in counts) {
      const template = templateMap[templateId];
      if (!template) continue;
      for (let i = 1; i <= counts[templateId]; i++) {
        finalCells.push({ ...template, id: `${templateId}-${i}` });
      }
    }
    return finalCells;
  };

  // 深海アドベンチャー用のデータ準備
  const deepSeaActionCardsThreeSets = createUniqueCards(deepSeaActionCardsBaseJson, 3);
  const completeDeepSeaCells2D = (() => {
    const cells1D = createBoardCells(deepSeaCellsBaseJson, CELL_COUNTS);
    const cells2D: any[][] = [];
    for (let r = 0; r < ROWS; r++) {
      cells2D.push(cells1D.slice(r * COLS, (r + 1) * COLS));
    }
    return cells2D;
  })();

  const DEEP_SEA_RESOURCES = [
    { resourceId: 'OXYGEN', name: '酸素', icon: '🫧', currentValue: 50, maxValue: 50, type: 'CONSUMABLE' as const },
    {
      resourceId: 'BATTERY',
      name: 'バッテリー',
      icon: '🔋',
      currentValue: 6,
      maxValue: 6,
      type: 'CONSUMABLE' as const,
    },
  ];

  const DEEP_SEA_TOKENS_ARTIFACT = [{ id: 'ARTIFACT', name: '💰', color: '#D4AF37' }];

  const createUniqueTokens = (templates: any[], count: number) =>
    templates.flatMap((t) =>
      Array.from({ length: count }, (_, i) => ({
        ...t,
        id: `${t.id}-${i + 1}`,
        templateId: t.id,
      })),
    );

  // --- プリセット定義 ---
  const GAME_PRESETS_COLLECTION: Record<GameId, RoomParam> = {
    sample: {
      gameId: 'sample',
      initialDecks: [{ deckId: 'numberDeck', name: '数字カード', cards: numberCardsJson, backColor: '#000000ff' }],
      initialBoard: [[{ id: 'start', type: 'START', position: { row: 0, col: 0 }, effect: 'start' }]],
      maxPlayers: 1,
    },
    deepsea: {
      gameId: 'deepsea',
      initialDecks: [
        { deckId: 'deepSeaSpecies', name: '深海生物カード', cards: deepSeaSpeciesDeckJson, backColor: '#0d3c99ff' },
        {
          deckId: 'deepSeaAction',
          name: 'アクションカード',
          cards: deepSeaActionCardsThreeSets,
          backColor: '#0d8999ff',
        },
      ],
      cardEffects,
      initialResources: DEEP_SEA_RESOURCES,
      initialTokenStores: [
        { tokenStoreId: 'ARTIFACT', name: '遺物', tokens: createUniqueTokens(DEEP_SEA_TOKENS_ARTIFACT, 10) },
      ],
      initialHand: { deckId: 'deepSeaAction', count: 6 },
      initialBoard: completeDeepSeaCells2D,
      cellEffects,
      checkGameEnd: (room: RoomState) =>
        // 終了条件: 5ラウンド終了 (5ラウンド目の最後 かつ 最後のプレイヤーの手番時)
        room.currentRoundIndex >= 4 && room.currentTurnIndex == room.initRoomState.players.length - 1,
      onGameEnd: (room: RoomState) => {
        const rankings = [...room.initRoomState.players]
          .sort((a, b) => b.score - a.score)
          .map((p, index) => ({ rank: index + 1, name: p.name, score: p.score }));
        return { message: '潜水任務完了', rankings, finalRound: room.currentRoundIndex };
      },
    },
  };

  // --- GameServer インスタンス作成 ---
  const options: GameServerOptions = {
    port: 4000,
    clientDistPath: path.resolve(__dirname, '..', 'dist'),
    libDistPath: path.resolve('../dist'),
    corsOrigins: ['http://localhost:5173', 'http://localhost:4000'],
    gamePresets: GAME_PRESETS_COLLECTION,
    customEvents,
    initialLogCategories: {
      connection: true,
      deck: true,
      room: true,
      lobby: true,
    },
    onServerStart: (url: string) => console.log(`🎮 Demo server running at: ${url}`),
  };

  const demoServer = new GameServer(options);
  demoServer.start();
}

startServer().catch((err) => {
  console.error('致命的なエラー: サーバー起動に失敗しました。', err);
  process.exit(1);
});
