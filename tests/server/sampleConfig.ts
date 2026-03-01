// tests/server/sampleConfig.ts

import type { RoomParam } from 'react-game-ui';
import { RoomConfig, SetupHelper } from 'react-game-ui/server-io-utils';

export const sampleConfig: RoomConfig = {
  gameId: 'sample',
  dataFiles: {
    cards: './data/numberCards.json',
  },
  setup: async (loadedData: Record<string, any>): Promise<RoomParam> => {
    const helper = new SetupHelper();
    const numberCards = helper.createUniqueCards(helper.assertCards(loadedData.cards), 1);

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
