// src/server/deepAbyssConfig.ts

import type { RoomParam, RoomState } from 'react-game-ui';
import { helpers, RoomConfig } from 'react-game-ui/server-io-utils';

const CELL_COUNTS = { RA: 5, RB: 10, B_NORM: 4, B_TRACK: 3, T_VOL: 7, T_CRF: 6, N_A: 12, N_B: 17 };

export const deepAbyssConfig: RoomConfig = {
  gameId: 'deepabyss',
  dataFiles: {
    deepAbyssSpeciesCards: './data/deepSeaSpeciesCards.json',
    deepAbyssActionCards: './data/deepSeaActionCards.json',
    deepAbyssCells: './data/deepSeaCells.json',
  },
  setup: async (loadedData: Record<string, any>): Promise<RoomParam> => {
    const deepAbyssSpeciesDeckJson = helpers.createUniqueCards(
      helpers.assertCards(loadedData.deepAbyssSpeciesCards),
      1,
    );
    const deepAbyssActionDeckJson = helpers.createUniqueCards(helpers.assertCards(loadedData.deepAbyssActionCards), 3);
    const deepAbyssCellsBaseJson: any[] = loadedData.deepAbyssCells;

    // エフェクトデータの動的ロード
    const [cardEffectsModule, cellEffectsModule] = await Promise.all([
      import('../data/cardEffects.js').catch(() => ({ cardEffects: {} })),
      import('../data/cellEffects.js').catch(() => ({ cellEffects: {} })),
    ]);

    const activeCardEffects = cardEffectsModule.cardEffects || {};
    const activeCellEffects = cellEffectsModule.cellEffects || {};

    return {
      gameId: 'deepabyss',
      initialDecks: [
        {
          deckId: 'deepAbyssSpecies',
          name: '深海生物カード',
          cards: deepAbyssSpeciesDeckJson,
          backColor: '#0d3c99ff',
        },
        {
          deckId: 'deepAbyssAction',
          name: 'アクションカード',
          cards: deepAbyssActionDeckJson,
          backColor: '#0d8999ff',
        },
      ],
      initialTokenStores: [
        {
          tokenStoreId: 'ARTIFACT',
          name: '遺物',
          tokens: helpers.createTokenStore(
            'ARTIFACT',
            '💰',
            [{ id: 'ARTIFACT', name: '💰', color: '#D4AF37', imageSrc: '', count: 1 }],
            10,
          ),
        },
      ],
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
      initialHand: { deckId: 'deepAbyssAction', count: 6 },
      initialBoard: { deepAbyssBoard: helpers.createBoardLayout(deepAbyssCellsBaseJson, CELL_COUNTS, 8) },
      cardEffects: activeCardEffects,
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
    };
  },
};
