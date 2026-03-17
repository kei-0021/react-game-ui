// src/server/deepAbyssConfig.ts

import { type Card, type GameParam, type Player, type RoomState } from 'react-game-ui';
import { RoomConfig, SetupHelper } from 'react-game-ui/server-io-utils';
import { RoomManager } from 'react-game-ui/server-utils';
import { CardPlayData } from '../../src/types/socketData.js';
import { DeepAbyssPhase } from '../types/phase.js';

export const CELL_COUNTS = {
  RELIC_1: 5,
  RELIC_2: 10,
  ENERGY: 8,
  DANGER: 7,
  EMPTY: 29,
  ABYSS: 5,
};

export const deepAbyssConfig: RoomConfig = {
  gameId: 'deepabyss',
  dataFiles: {
    deepAbyssSpeciesCards: './data/deepAbyssSpeciesCards.json',
    deepAbyssActionCards: './data/deepAbyssActionCards.json',
    deepAbyssCells: './data/deepAbyssCells.json',
  },
  setup: async (loadedData: Record<string, any>): Promise<GameParam> => {
    const helper = new SetupHelper();

    const defaults: Partial<Card> = {
      location: 'deck',
      drawCondition: ['field', 'back'],
      playLocation: 'discard',
      // fieldBackCondition: ['hand', 'face'],
    };

    const deepAbyssSpeciesDeck = helper.createUniqueCards(
      helper.initializeCards(helper.assertCards(loadedData.deepAbyssSpeciesCards), defaults),
      1,
    );
    const deepAbyssActionDeck = helper.createUniqueCards(helper.assertCards(loadedData.deepAbyssActionCards), 3);
    const deepAbyssBoard = helper.createGridBoardLayout(loadedData.deepAbyssCells, CELL_COUNTS, 8, 8);

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
          tokens: helper.createTokenStore([{ id: 'ARTIFACT', name: '💰' }], 20, undefined, '#D4AF37'),
        },
        {
          tokenStoreId: 'Hanabishi',
          name: '花火師',
          tokens: helper.createTokenStore([{ id: '花火師', name: '🎆' }], 20, '/hanabishi.svg', '#d43737'),
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
      randomBoard: ['deepAbyssBoard'],
      pieceImage: '/hanabishi.svg',
      initialPhase: DeepAbyssPhase.START,
      cardEffects: activeCardEffects,
      cellEffects: activeCellEffects,
      onCardPlay: (state: RoomState, manager: RoomManager, data: CardPlayData) => {
        // 全員に+2点する
        state.players.forEach((player: Player) => {
          manager.addScore(player.id, 2);
        });
        // 場のカードから名前を抽出して「、」で繋げる
        const cardNames = data.cardIds
          ?.map((id) => state.playFieldCards['deepAbyssAction'].find((c) => c.id === id)?.name)
          .filter(Boolean) // 名前が見つからない場合を除外
          .join('、');

        manager.emitSystemMessage(`${cardNames} を出した！`, 1000, true);
        manager.updatePhase(DeepAbyssPhase.NEXT);
      },
      onPieceMove: (state: RoomState, manager: RoomManager, newLocation: any) => {
        // マス目をオープンにする
        manager.updateCellExploredStatus(newLocation, true);
      },
      onNextRound: (state: RoomState, manager: RoomManager) => {
        manager.updatePhase(DeepAbyssPhase.NEXT);
        manager.emitSystemMessage(`第 ${state.currentRoundIndex + 1} ラウンド開始！`, 1000, true);
        manager.unholdCards();
      },
      checkGameEnd: (state: RoomState) =>
        // 終了条件: 5ラウンド終了 (5ラウンド目の最後 かつ 最後のプレイヤーの手番時)
        state.currentRoundIndex >= 4 && state.currentTurnIndex % state.players.length == state.players.length - 1,
      onGameEnd: (state: RoomState) => {
        const rankings = [...state.players]
          .sort((a, b) => b.score - a.score)
          .map((p, index) => ({ rank: index + 1, name: p.name, score: p.score }));
        return { message: '潜水任務完了', rankings, finalRound: state.currentRoundIndex };
      },
    };
  },
};
