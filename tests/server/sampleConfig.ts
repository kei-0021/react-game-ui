// tests/server/sampleConfig.ts

import type { RoomParam } from 'react-game-ui';
import { Config, SetupTools } from 'react-game-ui/server-io-utils';

export const sampleConfig: Config = {
  gameId: 'sample',
  dataFiles: {
    cards: './data/numberCards.json',
  },
  // サーバー側でロードしたデータを setup に渡す
  setup: (loadedData: Record<string, any>, helpers: SetupTools): RoomParam => {
    // 固有ロジック：カードを3セット分複製してユニーク化
    const numberCardsJson = helpers.createUniqueCards(helpers.assertCards(loadedData.cards, 'number'), 1);

    return {
      gameId: 'sample',
      initialDecks: [
        {
          deckId: 'numberDeck',
          name: '数字カード',
          cards: numberCardsJson,
          backColor: '#000000',
        },
      ],
      maxPlayers: 1,
    };
  },
};
