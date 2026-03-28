export const PokerData: any = {
  "gameId": "poker",
  "gameIcon": "🎲",
  "maxPlayers": 4,
  "initialDecks": [],
  "draggables": {
    "piece": {
      "id": "piece",
      "coordinate": {
        "x": 500,
        "y": 500
      },
      "zIndex": 100,
      "rotation": 0
    },
    "piece-0": {
      "id": "piece-0",
      "coordinate": {
        "x": 500,
        "y": 500
      },
      "zIndex": 100,
      "rotation": 0
    }
  },
  "components": [
    {
      "id": "0",
      "type": "Draggable",
      "props": {
        "draggableId": "piece-0",
        "image": "/hanabishi.svg",
        "mask": true,
        "color": "red",
        "size": 100,
        "isDebug": true
      }
    }
  ]
};