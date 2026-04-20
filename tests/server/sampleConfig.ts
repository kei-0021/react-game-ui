// tests/server/sampleConfig.ts

import { CardData, DraggableData, DraggableId, GameParam, RoomManager } from 'react-game-ui';
import { RoomConfig, SetupHelper } from 'react-game-ui/server-io-utils';

const Z_INDX_DRAGGABLE = 201;

export const sampleConfig: RoomConfig = {
  gameId: 'sample',
  dataFiles: {
    cards: './data/numberCards.json',
  },
  setup: async (loadedData: Record<string, any>): Promise<GameParam> => {
    const { sampleData } = await import(`./sampleData.js?t=${Date.now()}`);
    const helper = new SetupHelper();

    const defaults: Partial<CardData> = {
      location: 'deck',
      drawCondition: ['field', 'face'],
      playLocation: 'discard',
      fieldBackCondition: ['hand', 'face'],
      rotation: 0,
    };

    const numberCards = helper.createUniqueCards(
      helper.initializeCards(helper.assertCards(loadedData.cards), defaults),
      1,
    );

    const draggables: Record<DraggableId, DraggableData> = {};
    draggables['piece'] = helper.createDraggable('piece', { x: 500, y: 500 }, 100);
    for (let i = 0; i < 10; i++) {
      const id = `piece-${i}`;
      draggables[id] = helper.createDraggable(id, { x: 1000 + i * 20, y: 500 + i * 20 }, Z_INDX_DRAGGABLE + i);
    }

    return {
      gameId: 'sample',
      gameIcon: '◼️',
      initialDecks: [
        {
          deckId: 'numberDeck',
          name: '数字カード',
          cards: numberCards,
          backColor: '#000000',
        },
      ],
      draggables: draggables,
      dice: { '6面': { diceId: '6面', currentValue: 1 } },
      maxPlayers: 1,
      onDiceRoll: (value: number, manager: RoomManager) => {
        if (value == 1) {
          manager.updateTurn();
        }
      },
      components: [
        {
          id: 'dice-1',
          type: 'Dice',
          props: {
            diceId: '天気',
            sides: 4,
            title: '天気ダイス',
            tooltipText: '快晴・曇り・風・雨',
            customFaces: ['/weather_sunny.png', '/weather_cloud.png', '/weather_wind.png', '/weather_rain.png'],
          },
        },
      ],
      ...sampleData,
    };
  },
};
