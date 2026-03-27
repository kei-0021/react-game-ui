export const PokerData: any = {
  "gameId": "poker",
  "gameIcon": "🎲",
  "maxPlayers": 4,
  "initialDecks": [
    {
      "deckId": "deck-0",
      "name": "カード",
      "backColor": "black",
      "cards": []
    },
    {
      "deckId": "deck-0",
      "name": "カード",
      "backColor": "black",
      "cards": [
        {
          "id": "1",
          "deckId": "deck-0",
          "name": "1",
          "ownerId": null,
          "location": "deck",
          "drawCondition": [
            "field",
            "face"
          ],
          "playLocation": "discard",
          "isFaceUp": true,
          "backColor": "black"
        }
      ]
    }
  ],
  "draggables": {
    "piece": {
      "id": "piece-0",
      "coordinate": {
        "x": 500,
        "y": 500
      },
      "zIndex": 100,
      "rotation": 0
    },
    "piece-2": {
      "id": "piece-2",
      "coordinate": {
        "x": 500,
        "y": 500
      },
      "zIndex": 100,
      "rotation": 0
    },
    "piece-1": {
      "id": "piece-1",
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
      "type": "Deck",
      "props": {
        "deckId": "deck-0"
      }
    }
  ]
};