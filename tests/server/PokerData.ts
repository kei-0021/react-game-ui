export const PokerData: any = {
  "gameId": "poker",
  "gameIcon": "🎲",
  "maxPlayers": 4,
  "initialDecks": [],
  "draggable": {
    "piece": {
      "id": "piece",
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
      "id": "1",
      "type": "Draggable",
      "props": {
        "draggableId": "piece2",
        "image": "/hanabishi.svg",
        "mask": true,
        "color": "red",
        "size": 100,
        "isDebug": true
      }
    },
    {
      "id": "2",
      "type": "Dice",
      "props": {
        "diceId": "天気",
        "sides": 4,
        "title": "天気ダイス",
        "tooltipText": "快晴・曇り・風・雨",
        "customFaces": [
          "/weather_sunny.png",
          "/weather_cloud.png",
          "/weather_wind.png",
          "/weather_rain.png"
        ]
      }
    },
    {
      "id": "3",
      "type": "Dice",
      "props": {
        "diceId": "天気",
        "sides": 4,
        "title": "天気ダイス",
        "tooltipText": "快晴・曇り・風・雨",
        "customFaces": [
          "/weather_sunny.png",
          "/weather_cloud.png",
          "/weather_wind.png",
          "/weather_rain.png"
        ]
      }
    }
  ],
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
    "piece2": {
      "id": "piece2",
      "coordinate": {
        "x": 600,
        "y": 600
      },
      "zIndex": 100,
      "rotation": 0
    }
  }
};