// src/server/deepAbyssConfig.ts

import type { Card, Player, RoomParam, RoomState } from 'react-game-ui';
import { RoomConfig, SetupHelper } from 'react-game-ui/server-io-utils';
import { CardPlayData } from '../../dist/types/socketData.js';

const CELL_COUNTS = { RA: 5, RB: 10, B_NORM: 4, B_TRACK: 3, T_VOL: 7, T_CRF: 6, N_A: 12, N_B: 17 };

export const deepAbyssConfig: RoomConfig = {
  gameId: 'deepabyss',
  dataFiles: {
    deepAbyssSpeciesCards: './data/deepSeaSpeciesCards.json',
    deepAbyssActionCards: './data/deepSeaActionCards.json',
    deepAbyssCells: './data/deepSeaCells.json',
  },
  setup: async (loadedData: Record<string, any>): Promise<RoomParam> => {
    const helper = new SetupHelper();

    const defaults: Partial<Card> = {
      location: 'deck',
      drawCondition: ['field', 'back'],
      playLocation: 'discard',
      fieldBackCondition: ['hand', 'face'],
    };

    const deepAbyssSpeciesDeck = helper.createUniqueCards(
      helper.initializeCards(helper.assertCards(loadedData.deepAbyssSpeciesCards), defaults),
      1,
    );
    const deepAbyssActionDeck = helper.createUniqueCards(helper.assertCards(loadedData.deepAbyssActionCards), 3);
    const deepAbyssBoard = helper.createBoardLayout(loadedData.deepAbyssCells, CELL_COUNTS, 8);

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
          cards: deepAbyssSpeciesDeck,
          backColor: '#0d3c99ff',
        },
        {
          deckId: 'deepAbyssAction',
          name: 'アクションカード',
          cards: deepAbyssActionDeck,
          backColor: '#0d8999ff',
        },
      ],
      initialTokenStores: [
        {
          tokenStoreId: 'ARTIFACT',
          name: '遺物',
          tokens: helper.createTokenStore(
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
      initialBoard: { deepAbyssBoard: deepAbyssBoard },
      cardEffects: activeCardEffects,
      cellEffects: activeCellEffects,
      onCardPlay: (param: RoomParam, state: RoomState, data: CardPlayData) => {
        state.initRoomState.players.forEach((player: Player) => {
          player.score = player.score + 2;
        });
      },
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
