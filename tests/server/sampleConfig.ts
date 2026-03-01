// tests/server/sampleConfig.ts

import type { RoomParam } from 'react-game-ui';
import { RoomConfig, helpers } from 'react-game-ui/server-io-utils';

export const sampleConfig: RoomConfig = {
  gameId: 'sample',
  dataFiles: {
    cards: './data/numberCards.json',
  },
  setup: async (loadedData: Record<string, any>): Promise<RoomParam> => {
    const numberCards = helpers.createUniqueCards(helpers.assertCards(loadedData.cards), 1);

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
      maxPlayers: 1,
    };
  },
};
