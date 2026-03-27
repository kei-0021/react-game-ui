import type { GameParam } from 'react-game-ui';
import { type RoomConfig } from 'react-game-ui/server-io-utils';

export const PokerConfig: RoomConfig = {
  gameId: 'poker',
  dataFiles: [],
  setup: async (): Promise<GameParam> => {
    const { PokerData } = await import(`./PokerData.ts?t=${Date.now()}`);

    const initialDraggables = {
      piece: {
        id: 'piece',
        coordinate: { x: 500, y: 500 },
        zIndex: 100,
        rotation: 0,
      },
    };

    return {
      gameId: 'poker',
      gameIcon: '🎲',
      maxPlayers: 4,
      initialDecks: [],
      initialBoard: {},
      draggables: initialDraggables,
      checkGameEnd: () => false,
      onGameEnd: () => ({ message: '終了' }),
      components: [],
      ...PokerData,
    };
  },
};
