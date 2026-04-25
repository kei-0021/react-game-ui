// src/server/deepAbyssConfig.ts

import { roomInterpreter } from '@/server/room-interpreter.js';
import { CardData, CardPlayData, GameParam, RoomManager, RoomState } from 'react-game-ui';
import { RoomConfig, SetupHelper } from 'react-game-ui/server-io-utils';
import { DeepAbyssPhase } from '../types/phase.js';
import { cellShuffleAndReconnector } from './cellShuffleAndReConnecter.js';

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
    const { deepabyssData } = await import(`./deepabyssData.js?t=${Date.now()}`);

    const helper = new SetupHelper();

    const defaults: Partial<CardData> = {
      location: 'deck',
      drawCondition: ['field', 'back'],
      playLocation: 'discard',
      fieldBackCondition: ['discard', 'face'],
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
      gameIcon: '🌊',
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
            [{ id: 'ARTIFACT', tokenStoreId: 'ARTIFACT', name: '💰', ownerId: null, position: null, movableCells: [] }],
            20,
            undefined,
            '#D4AF37',
          ),
        },
        {
          tokenStoreId: 'Hanabishi',
          name: '花火師',
          tokens: helper.createTokenStore(
            [{ id: '花火師', tokenStoreId: 'HANABISHI', name: '🎆', ownerId: null, position: null, movableCells: [] }],
            20,
            '/hanabishi.svg',
            '#d43737',
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
      initialHand: { deepAbyssAction: 6 },
      initialTokens: { ARTIFACT: 2, Hanabishi: 3 },
      initialBoard: { deepAbyssBoard: deepAbyssBoard },
      initialTokensOnBoard: {
        piece: [
          {
            id: 'piece',
            name: 'piece',
            ownerId: 'player',
            color: '#ff4444',
            position: { row: 2, col: 3 },
            image: '/hanabishi.svg',
          },
        ],
        'piece-2': [
          {
            id: 'piece-2',
            name: 'piece-2',
            ownerId: 'player',
            color: '#ff4444',
            position: { row: 2, col: 3 },
            image: '/hanabishi.svg',
          },
        ],
        'item-treasure': [
          {
            id: 'item-treasure',
            name: '敵',
            ownerId: null,
            color: '#ffd700',
            position: { row: 5, col: 5 },
          },
        ],
        'enemy-boss': [
          {
            id: 'enemy-boss',
            name: '敵',
            ownerId: null,
            color: '#8b0000',
            position: { row: 0, col: 0 },
          },
        ],
      },
      shuffleAndReconnectBoard: { deepAbyssBoard: cellShuffleAndReconnector },
      initialPhase: DeepAbyssPhase.START,
      cardEffects: activeCardEffects,
      cellEffects: activeCellEffects,
      onCardPlay: (state: RoomState, manager: RoomManager, data: CardPlayData) => {
        // 全員に+2点する
        roomInterpreter([{ type: 'ADD_SCORE', playerId: 'ALL', points: 2 }], state, manager);

        // 場のカードから名前を抽出して「、」で繋げる
        const cardNames = data.cardIds
          ?.map((id) => state.playFieldCards['deepAbyssAction'].find((c) => c.id === id)?.name)
          .filter(Boolean) // 名前が見つからない場合を除外
          .join('、');

        manager.emitSystemMessage(`${cardNames} を出した！`, 1000, true);
        roomInterpreter([{ type: 'UPDATE_PHASE', newPhase: DeepAbyssPhase.NEXT }], state, manager);
      },
      onTokenMove: (state: RoomState, manager: RoomManager, newLocation: any) => {
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
      components: [],
      ...deepabyssData,
    };
  },
};
