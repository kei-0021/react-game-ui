// tests/server.ts
import path from 'path';
import type { GameId, RoomParam, RoomState } from 'react-game-ui';
import { GameServer, type GameServerOptions } from 'react-game-ui/server';
import {
  chunkTo2D,
  generateFromTemplates,
  loadJsonAssert,
  replicateData,
  Validators,
} from 'react-game-ui/server-io-utils';
import { fileURLToPath } from 'url';
import { customEvents } from './data/customEvents.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  // エフェクトデータの動的ロード
  const [cardEffectsModule, cellEffectsModule] = await Promise.all([
    import('./data/cardEffects.js').catch(() => ({ cardEffects: {} })),
    import('./data/cellEffects.js').catch(() => ({ cellEffects: {} })),
  ]);

  const activeCardEffects = cardEffectsModule.cardEffects || {};
  const activeCellEffects = cellEffectsModule.cellEffects || {};

  // JSONデータのロードとバリデーション
  const [numberCardsJson, deepSeaActionCardsBaseJson, deepSeaCellsBaseJson, deepSeaSpeciesDeckJson] = await Promise.all(
    [
      loadJsonAssert(path.join(__dirname, 'data/numberCards.json'), Validators.isCardArray),
      loadJsonAssert(path.join(__dirname, 'data/deepSeaActionCards.json'), Validators.isCardArray),
      loadJsonAssert(path.join(__dirname, 'data/deepSeaCells.json'), Validators.isCellArray),
      loadJsonAssert(path.join(__dirname, 'data/deepSeaSpeciesCards.json'), Validators.isCardArray),
    ],
  );

  // 設定定数
  const CELL_COUNTS = { RA: 5, RB: 10, B_NORM: 4, B_TRACK: 3, T_VOL: 7, T_CRF: 6, N_A: 12, N_B: 17 };

  // プリセット定義
  const GAME_PRESETS_COLLECTION: Record<GameId, RoomParam> = {
    sample: {
      gameId: 'sample',
      initialDecks: [{ deckId: 'numberDeck', name: '数字カード', cards: numberCardsJson, backColor: '#000000ff' }],
      maxPlayers: 1,
    },
    deepsea: {
      gameId: 'deepsea',
      initialDecks: [
        { deckId: 'deepSeaSpecies', name: '深海生物カード', cards: deepSeaSpeciesDeckJson, backColor: '#0d3c99ff' },
        {
          deckId: 'deepSeaAction',
          name: 'アクションカード',
          cards: replicateData(deepSeaActionCardsBaseJson, 3),
          backColor: '#0d8999ff',
        },
      ],
      cardEffects: activeCardEffects,
      initialResources: [
        { resourceId: 'OXYGEN', name: '酸素', icon: '🫧', currentValue: 50, maxValue: 50, type: 'CONSUMABLE' as const },
        {
          resourceId: 'BATTERY',
          name: 'バッテリー',
          icon: '🔋',
          currentValue: 6,
          maxValue: 6,
          type: 'CONSUMABLE' as const,
        },
      ],
      initialTokenStores: [
        {
          tokenStoreId: 'ARTIFACT',
          name: '遺物',
          tokens: replicateData([{ id: 'ARTIFACT', name: '💰', color: '#D4AF37', imageSrc: '', count: 1 }], 10),
        },
      ],
      initialHand: { deckId: 'deepSeaAction', count: 6 },
      initialBoard: { deepAbyssBoard: chunkTo2D(generateFromTemplates(deepSeaCellsBaseJson, CELL_COUNTS), 8) },
      cellEffects: activeCellEffects,
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

  // サーバーオプションの設定
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
