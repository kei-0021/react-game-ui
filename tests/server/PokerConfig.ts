import type { GameParam } from "react-game-ui";
import { type RoomConfig } from "react-game-ui/server-io-utils";

export const PokerConfig: RoomConfig = {
  gameId: "poker",
  dataFiles: [],
  setup: async (): Promise<GameParam> => {
    const initialDraggables = {
      "piece": {
        id: "piece",
        coordinate: { x: 500, y: 500 },
        zIndex: 100,
        rotation: 0
      }
    };

    return {
      gameId: "poker",
      gameIcon: "🎲",
      maxPlayers: 4,
      initialDecks: [],
      initialBoard: {},
      draggable: initialDraggables,
      checkGameEnd: () => false,
      onGameEnd: () => ({ message: "終了" }),
      components: []
    };
  },
};
