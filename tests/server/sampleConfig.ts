// tests/server/sampleConfig.ts

import type { Card, GameParam } from 'react-game-ui';
import { RoomConfig, SetupHelper } from 'react-game-ui/server-io-utils';

export const sampleConfig: RoomConfig = {
  gameId: 'sample',
  dataFiles: {
    cards: './data/numberCards.json',
  },
  setup: async (loadedData: Record<string, any>): Promise<GameParam> => {
    const helper = new SetupHelper();

    const defaults: Partial<Card> = {
      location: 'deck',
      drawCondition: ['field', 'face'],
      playLocation: 'discard',
      fieldBackCondition: ['hand', 'face'],
    };

    const numberCards = helper.createUniqueCards(
      helper.initializeCards(helper.assertCards(loadedData.cards), defaults),
      1,
    );

    const draggable = helper.createDraggable('piece', { x: 1000, y: 500 });

    return {
      gameId: 'sample',
      initialDecks: [
        {
          deckId: 'numberDeck',
          name: '数字カード',
          cards: numberCards,
          backColor: '#000000',
        },
      ],
      draggable: { piece: draggable },
      maxPlayers: 1,
    };
  },
};
