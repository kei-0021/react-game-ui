export const DeepabyssData: any = {
  "gameId": "deepabyss",
  "gameIcon": "🌊",
  "initialDecks": [
    {
      "deckId": "deepAbyssSpecies",
      "name": "深海生物カード",
      "cards": [
        {
          "id": "species-01-angler-A-s1",
          "name": "オニアンコウ",
          "threatLevel": 1,
          "description": "潜水艦のライトに驚き、データを残さずに逃げた。\n脅威レベル: 1 (酸素 -1)",
          "frontImage": "/species_1.png",
          "location": "deck",
          "drawCondition": [
            "field",
            "back"
          ],
          "playLocation": "discard"
        },
        {
          "id": "species-01-angler-B-s1",
          "name": "オニアンコウ",
          "threatLevel": 1,
          "description": "潜水艦のライトに驚き、データを残さずに逃げた。\n脅威レベル: 1 (酸素 -1)",
          "frontImage": "/species_1.png",
          "location": "deck",
          "drawCondition": [
            "field",
            "back"
          ],
          "playLocation": "discard"
        },
        {
          "id": "species-02-viper-A-s1",
          "name": "キバモロコ",
          "threatLevel": 2,
          "description": "鋭い牙で潜水艦をかすめる！\n脅威レベル: 2 (エネルギー -2 & データ +1)",
          "frontImage": "/species_2.png",
          "location": "deck",
          "drawCondition": [
            "field",
            "back"
          ],
          "playLocation": "discard"
        },
        {
          "id": "species-02-viper-B-s1",
          "name": "キバモロコ",
          "threatLevel": 2,
          "description": "鋭い牙で潜水艦をかすめる！\n脅威レベル: 2 (エネルギー -2 & データ +1)",
          "frontImage": "/species_2.png",
          "location": "deck",
          "drawCondition": [
            "field",
            "back"
          ],
          "playLocation": "discard"
        },
        {
          "id": "species-03-blob-A-s1",
          "name": "ニュウドウカジカ",
          "threatLevel": 3,
          "description": "巨大な質量が潜水艦に衝突。主要システムにダメージ。\n脅威レベル: 3 (酸素 -2 & データ -1)",
          "frontImage": "/species_3.png",
          "location": "deck",
          "drawCondition": [
            "field",
            "back"
          ],
          "playLocation": "discard"
        },
        {
          "id": "species-03-blob-B-s1",
          "name": "ニュウドウカジカ",
          "threatLevel": 3,
          "description": "巨大な質量が潜水艦に衝突。主要システムにダメージ。\n脅威レベル: 3 (酸素 -2 & データ -1)",
          "frontImage": "/species_3.png",
          "location": "deck",
          "drawCondition": [
            "field",
            "back"
          ],
          "playLocation": "discard"
        }
      ],
      "backColor": "#0d3c99ff"
    },
    {
      "deckId": "deepAbyssAction",
      "name": "アクションカード",
      "cards": [
        {
          "id": "card-A-01-s1",
          "name": "探索",
          "type": "MOVE_EXPLORE",
          "batteryCost": 1,
          "movement": 1,
          "description": "隣接マスへ1マス移動し、裏向きタイルを表にする。バッテリーを1消費する。",
          "location": "deck",
          "drawCondition": [
            "hand",
            "face"
          ],
          "playLocation": "field",
          "fieldBackCondition": [
            "hand",
            "face"
          ],
          "freeShape": "true",
          "frontImage": "/hanabishi.svg"
        },
        {
          "id": "card-A-02-s1",
          "name": "探索",
          "type": "MOVE_EXPLORE",
          "batteryCost": 1,
          "movement": 1,
          "description": "隣接マスへ1マス移動し、裏向きタイルを表にする。バッテリーを1消費する。",
          "location": "deck",
          "drawCondition": [
            "hand",
            "face"
          ],
          "playLocation": "field",
          "fieldBackCondition": [
            "hand",
            "face"
          ],
          "frontImage": "/green_2.png"
        },
        {
          "id": "card-B-01-s1",
          "name": "航路移動",
          "type": "MOVE_EXISTING",
          "batteryCost": 0,
          "movement": 1,
          "description": "隣接マスへ1マス移動する。移動先は必ず表向きタイルであること。バッテリー消費なし。",
          "location": "deck",
          "drawCondition": [
            "hand",
            "back"
          ],
          "playLocation": "field",
          "fieldBackCondition": [
            "hand",
            "face"
          ],
          "frontImage": "/blue_1.png"
        },
        {
          "id": "card-B-02-s1",
          "name": "航路移動",
          "type": "MOVE_EXISTING",
          "batteryCost": 0,
          "movement": 1,
          "description": "隣接マスへ1マス移動する。移動先は必ず表向きタイルであること。バッテリー消費なし。",
          "location": "deck",
          "drawCondition": [
            "hand",
            "back"
          ],
          "playLocation": "field",
          "fieldBackCondition": [
            "hand",
            "face"
          ]
        },
        {
          "id": "card-C-01-s1",
          "name": "ソナー＆チャージ",
          "type": "RECOVER_INFO",
          "batteryCost": 0,
          "movement": 0,
          "description": "移動を行わず、バッテリーを2個回復する。さらに、隣接する裏向きタイルすべてを確認し、情報を得る。",
          "location": "deck",
          "drawCondition": [
            "hand",
            "back"
          ],
          "playLocation": "field",
          "fieldBackCondition": [
            "hand",
            "face"
          ]
        },
        {
          "id": "card-D-01-s1",
          "name": "スキャン",
          "type": "ACTION_SALVAGE",
          "batteryCost": 1,
          "movement": 0,
          "description": "移動を行わず、現在地で遺物トークンの回収、または地形データの収集を行う。",
          "location": "deck",
          "drawCondition": [
            "hand",
            "back"
          ],
          "playLocation": "field",
          "fieldBackCondition": [
            "hand",
            "face"
          ]
        },
        {
          "id": "card-A-01-s2",
          "name": "探索",
          "type": "MOVE_EXPLORE",
          "batteryCost": 1,
          "movement": 1,
          "description": "隣接マスへ1マス移動し、裏向きタイルを表にする。バッテリーを1消費する。",
          "location": "deck",
          "drawCondition": [
            "hand",
            "face"
          ],
          "playLocation": "field",
          "fieldBackCondition": [
            "hand",
            "face"
          ],
          "freeShape": "true",
          "frontImage": "/hanabishi.svg"
        },
        {
          "id": "card-A-02-s2",
          "name": "探索",
          "type": "MOVE_EXPLORE",
          "batteryCost": 1,
          "movement": 1,
          "description": "隣接マスへ1マス移動し、裏向きタイルを表にする。バッテリーを1消費する。",
          "location": "deck",
          "drawCondition": [
            "hand",
            "face"
          ],
          "playLocation": "field",
          "fieldBackCondition": [
            "hand",
            "face"
          ],
          "frontImage": "/green_2.png"
        },
        {
          "id": "card-B-01-s2",
          "name": "航路移動",
          "type": "MOVE_EXISTING",
          "batteryCost": 0,
          "movement": 1,
          "description": "隣接マスへ1マス移動する。移動先は必ず表向きタイルであること。バッテリー消費なし。",
          "location": "deck",
          "drawCondition": [
            "hand",
            "back"
          ],
          "playLocation": "field",
          "fieldBackCondition": [
            "hand",
            "face"
          ],
          "frontImage": "/blue_1.png"
        },
        {
          "id": "card-B-02-s2",
          "name": "航路移動",
          "type": "MOVE_EXISTING",
          "batteryCost": 0,
          "movement": 1,
          "description": "隣接マスへ1マス移動する。移動先は必ず表向きタイルであること。バッテリー消費なし。",
          "location": "deck",
          "drawCondition": [
            "hand",
            "back"
          ],
          "playLocation": "field",
          "fieldBackCondition": [
            "hand",
            "face"
          ]
        },
        {
          "id": "card-C-01-s2",
          "name": "ソナー＆チャージ",
          "type": "RECOVER_INFO",
          "batteryCost": 0,
          "movement": 0,
          "description": "移動を行わず、バッテリーを2個回復する。さらに、隣接する裏向きタイルすべてを確認し、情報を得る。",
          "location": "deck",
          "drawCondition": [
            "hand",
            "back"
          ],
          "playLocation": "field",
          "fieldBackCondition": [
            "hand",
            "face"
          ]
        },
        {
          "id": "card-D-01-s2",
          "name": "スキャン",
          "type": "ACTION_SALVAGE",
          "batteryCost": 1,
          "movement": 0,
          "description": "移動を行わず、現在地で遺物トークンの回収、または地形データの収集を行う。",
          "location": "deck",
          "drawCondition": [
            "hand",
            "back"
          ],
          "playLocation": "field",
          "fieldBackCondition": [
            "hand",
            "face"
          ]
        },
        {
          "id": "card-A-01-s3",
          "name": "探索",
          "type": "MOVE_EXPLORE",
          "batteryCost": 1,
          "movement": 1,
          "description": "隣接マスへ1マス移動し、裏向きタイルを表にする。バッテリーを1消費する。",
          "location": "deck",
          "drawCondition": [
            "hand",
            "face"
          ],
          "playLocation": "field",
          "fieldBackCondition": [
            "hand",
            "face"
          ],
          "freeShape": "true",
          "frontImage": "/hanabishi.svg"
        },
        {
          "id": "card-A-02-s3",
          "name": "探索",
          "type": "MOVE_EXPLORE",
          "batteryCost": 1,
          "movement": 1,
          "description": "隣接マスへ1マス移動し、裏向きタイルを表にする。バッテリーを1消費する。",
          "location": "deck",
          "drawCondition": [
            "hand",
            "face"
          ],
          "playLocation": "field",
          "fieldBackCondition": [
            "hand",
            "face"
          ],
          "frontImage": "/green_2.png"
        },
        {
          "id": "card-B-01-s3",
          "name": "航路移動",
          "type": "MOVE_EXISTING",
          "batteryCost": 0,
          "movement": 1,
          "description": "隣接マスへ1マス移動する。移動先は必ず表向きタイルであること。バッテリー消費なし。",
          "location": "deck",
          "drawCondition": [
            "hand",
            "back"
          ],
          "playLocation": "field",
          "fieldBackCondition": [
            "hand",
            "face"
          ],
          "frontImage": "/blue_1.png"
        },
        {
          "id": "card-B-02-s3",
          "name": "航路移動",
          "type": "MOVE_EXISTING",
          "batteryCost": 0,
          "movement": 1,
          "description": "隣接マスへ1マス移動する。移動先は必ず表向きタイルであること。バッテリー消費なし。",
          "location": "deck",
          "drawCondition": [
            "hand",
            "back"
          ],
          "playLocation": "field",
          "fieldBackCondition": [
            "hand",
            "face"
          ]
        },
        {
          "id": "card-C-01-s3",
          "name": "ソナー＆チャージ",
          "type": "RECOVER_INFO",
          "batteryCost": 0,
          "movement": 0,
          "description": "移動を行わず、バッテリーを2個回復する。さらに、隣接する裏向きタイルすべてを確認し、情報を得る。",
          "location": "deck",
          "drawCondition": [
            "hand",
            "back"
          ],
          "playLocation": "field",
          "fieldBackCondition": [
            "hand",
            "face"
          ]
        },
        {
          "id": "card-D-01-s3",
          "name": "スキャン",
          "type": "ACTION_SALVAGE",
          "batteryCost": 1,
          "movement": 0,
          "description": "移動を行わず、現在地で遺物トークンの回収、または地形データの収集を行う。",
          "location": "deck",
          "drawCondition": [
            "hand",
            "back"
          ],
          "playLocation": "field",
          "fieldBackCondition": [
            "hand",
            "face"
          ]
        }
      ],
      "backColor": "#0d8999ff"
    }
  ],
  "initialTokenStores": [
    {
      "tokenStoreId": "ARTIFACT",
      "name": "遺物",
      "tokens": [
        {
          "id": "ARTIFACT-s1",
          "tokenStoreId": "ARTIFACT",
          "name": "💰",
          "ownerId": null,
          "position": null,
          "movableCells": [],
          "color": "#D4AF37"
        },
        {
          "id": "ARTIFACT-s2",
          "tokenStoreId": "ARTIFACT",
          "name": "💰",
          "ownerId": null,
          "position": null,
          "movableCells": [],
          "color": "#D4AF37"
        },
        {
          "id": "ARTIFACT-s3",
          "tokenStoreId": "ARTIFACT",
          "name": "💰",
          "ownerId": null,
          "position": null,
          "movableCells": [],
          "color": "#D4AF37"
        },
        {
          "id": "ARTIFACT-s4",
          "tokenStoreId": "ARTIFACT",
          "name": "💰",
          "ownerId": null,
          "position": null,
          "movableCells": [],
          "color": "#D4AF37"
        },
        {
          "id": "ARTIFACT-s5",
          "tokenStoreId": "ARTIFACT",
          "name": "💰",
          "ownerId": null,
          "position": null,
          "movableCells": [],
          "color": "#D4AF37"
        },
        {
          "id": "ARTIFACT-s6",
          "tokenStoreId": "ARTIFACT",
          "name": "💰",
          "ownerId": null,
          "position": null,
          "movableCells": [],
          "color": "#D4AF37"
        },
        {
          "id": "ARTIFACT-s7",
          "tokenStoreId": "ARTIFACT",
          "name": "💰",
          "ownerId": null,
          "position": null,
          "movableCells": [],
          "color": "#D4AF37"
        },
        {
          "id": "ARTIFACT-s8",
          "tokenStoreId": "ARTIFACT",
          "name": "💰",
          "ownerId": null,
          "position": null,
          "movableCells": [],
          "color": "#D4AF37"
        },
        {
          "id": "ARTIFACT-s9",
          "tokenStoreId": "ARTIFACT",
          "name": "💰",
          "ownerId": null,
          "position": null,
          "movableCells": [],
          "color": "#D4AF37"
        },
        {
          "id": "ARTIFACT-s10",
          "tokenStoreId": "ARTIFACT",
          "name": "💰",
          "ownerId": null,
          "position": null,
          "movableCells": [],
          "color": "#D4AF37"
        },
        {
          "id": "ARTIFACT-s11",
          "tokenStoreId": "ARTIFACT",
          "name": "💰",
          "ownerId": null,
          "position": null,
          "movableCells": [],
          "color": "#D4AF37"
        },
        {
          "id": "ARTIFACT-s12",
          "tokenStoreId": "ARTIFACT",
          "name": "💰",
          "ownerId": null,
          "position": null,
          "movableCells": [],
          "color": "#D4AF37"
        },
        {
          "id": "ARTIFACT-s13",
          "tokenStoreId": "ARTIFACT",
          "name": "💰",
          "ownerId": null,
          "position": null,
          "movableCells": [],
          "color": "#D4AF37"
        },
        {
          "id": "ARTIFACT-s14",
          "tokenStoreId": "ARTIFACT",
          "name": "💰",
          "ownerId": null,
          "position": null,
          "movableCells": [],
          "color": "#D4AF37"
        },
        {
          "id": "ARTIFACT-s15",
          "tokenStoreId": "ARTIFACT",
          "name": "💰",
          "ownerId": null,
          "position": null,
          "movableCells": [],
          "color": "#D4AF37"
        },
        {
          "id": "ARTIFACT-s16",
          "tokenStoreId": "ARTIFACT",
          "name": "💰",
          "ownerId": null,
          "position": null,
          "movableCells": [],
          "color": "#D4AF37"
        },
        {
          "id": "ARTIFACT-s17",
          "tokenStoreId": "ARTIFACT",
          "name": "💰",
          "ownerId": null,
          "position": null,
          "movableCells": [],
          "color": "#D4AF37"
        },
        {
          "id": "ARTIFACT-s18",
          "tokenStoreId": "ARTIFACT",
          "name": "💰",
          "ownerId": null,
          "position": null,
          "movableCells": [],
          "color": "#D4AF37"
        },
        {
          "id": "ARTIFACT-s19",
          "tokenStoreId": "ARTIFACT",
          "name": "💰",
          "ownerId": null,
          "position": null,
          "movableCells": [],
          "color": "#D4AF37"
        },
        {
          "id": "ARTIFACT-s20",
          "tokenStoreId": "ARTIFACT",
          "name": "💰",
          "ownerId": null,
          "position": null,
          "movableCells": [],
          "color": "#D4AF37"
        }
      ]
    },
    {
      "tokenStoreId": "Hanabishi",
      "name": "花火師",
      "tokens": [
        {
          "id": "花火師-s1",
          "tokenStoreId": "HANABISHI",
          "name": "🎆",
          "ownerId": null,
          "position": null,
          "movableCells": [],
          "image": "/hanabishi.svg",
          "color": "#d43737"
        },
        {
          "id": "花火師-s2",
          "tokenStoreId": "HANABISHI",
          "name": "🎆",
          "ownerId": null,
          "position": null,
          "movableCells": [],
          "image": "/hanabishi.svg",
          "color": "#d43737"
        },
        {
          "id": "花火師-s3",
          "tokenStoreId": "HANABISHI",
          "name": "🎆",
          "ownerId": null,
          "position": null,
          "movableCells": [],
          "image": "/hanabishi.svg",
          "color": "#d43737"
        },
        {
          "id": "花火師-s4",
          "tokenStoreId": "HANABISHI",
          "name": "🎆",
          "ownerId": null,
          "position": null,
          "movableCells": [],
          "image": "/hanabishi.svg",
          "color": "#d43737"
        },
        {
          "id": "花火師-s5",
          "tokenStoreId": "HANABISHI",
          "name": "🎆",
          "ownerId": null,
          "position": null,
          "movableCells": [],
          "image": "/hanabishi.svg",
          "color": "#d43737"
        },
        {
          "id": "花火師-s6",
          "tokenStoreId": "HANABISHI",
          "name": "🎆",
          "ownerId": null,
          "position": null,
          "movableCells": [],
          "image": "/hanabishi.svg",
          "color": "#d43737"
        },
        {
          "id": "花火師-s7",
          "tokenStoreId": "HANABISHI",
          "name": "🎆",
          "ownerId": null,
          "position": null,
          "movableCells": [],
          "image": "/hanabishi.svg",
          "color": "#d43737"
        },
        {
          "id": "花火師-s8",
          "tokenStoreId": "HANABISHI",
          "name": "🎆",
          "ownerId": null,
          "position": null,
          "movableCells": [],
          "image": "/hanabishi.svg",
          "color": "#d43737"
        },
        {
          "id": "花火師-s9",
          "tokenStoreId": "HANABISHI",
          "name": "🎆",
          "ownerId": null,
          "position": null,
          "movableCells": [],
          "image": "/hanabishi.svg",
          "color": "#d43737"
        },
        {
          "id": "花火師-s10",
          "tokenStoreId": "HANABISHI",
          "name": "🎆",
          "ownerId": null,
          "position": null,
          "movableCells": [],
          "image": "/hanabishi.svg",
          "color": "#d43737"
        },
        {
          "id": "花火師-s11",
          "tokenStoreId": "HANABISHI",
          "name": "🎆",
          "ownerId": null,
          "position": null,
          "movableCells": [],
          "image": "/hanabishi.svg",
          "color": "#d43737"
        },
        {
          "id": "花火師-s12",
          "tokenStoreId": "HANABISHI",
          "name": "🎆",
          "ownerId": null,
          "position": null,
          "movableCells": [],
          "image": "/hanabishi.svg",
          "color": "#d43737"
        },
        {
          "id": "花火師-s13",
          "tokenStoreId": "HANABISHI",
          "name": "🎆",
          "ownerId": null,
          "position": null,
          "movableCells": [],
          "image": "/hanabishi.svg",
          "color": "#d43737"
        },
        {
          "id": "花火師-s14",
          "tokenStoreId": "HANABISHI",
          "name": "🎆",
          "ownerId": null,
          "position": null,
          "movableCells": [],
          "image": "/hanabishi.svg",
          "color": "#d43737"
        },
        {
          "id": "花火師-s15",
          "tokenStoreId": "HANABISHI",
          "name": "🎆",
          "ownerId": null,
          "position": null,
          "movableCells": [],
          "image": "/hanabishi.svg",
          "color": "#d43737"
        },
        {
          "id": "花火師-s16",
          "tokenStoreId": "HANABISHI",
          "name": "🎆",
          "ownerId": null,
          "position": null,
          "movableCells": [],
          "image": "/hanabishi.svg",
          "color": "#d43737"
        },
        {
          "id": "花火師-s17",
          "tokenStoreId": "HANABISHI",
          "name": "🎆",
          "ownerId": null,
          "position": null,
          "movableCells": [],
          "image": "/hanabishi.svg",
          "color": "#d43737"
        },
        {
          "id": "花火師-s18",
          "tokenStoreId": "HANABISHI",
          "name": "🎆",
          "ownerId": null,
          "position": null,
          "movableCells": [],
          "image": "/hanabishi.svg",
          "color": "#d43737"
        },
        {
          "id": "花火師-s19",
          "tokenStoreId": "HANABISHI",
          "name": "🎆",
          "ownerId": null,
          "position": null,
          "movableCells": [],
          "image": "/hanabishi.svg",
          "color": "#d43737"
        },
        {
          "id": "花火師-s20",
          "tokenStoreId": "HANABISHI",
          "name": "🎆",
          "ownerId": null,
          "position": null,
          "movableCells": [],
          "image": "/hanabishi.svg",
          "color": "#d43737"
        }
      ]
    }
  ],
  "initialResources": [
    {
      "resourceId": "OXYGEN",
      "name": "酸素",
      "icon": "🫧",
      "currentValue": 50,
      "maxValue": 50,
      "type": "CONSUMABLE"
    },
    {
      "resourceId": "BATTERY",
      "name": "バッテリー",
      "icon": "🔋",
      "currentValue": 6,
      "maxValue": 6,
      "type": "CONSUMABLE"
    }
  ],
  "initialHand": {
    "deepAbyssAction": 6
  },
  "initialTokens": {
    "ARTIFACT": 2,
    "Hanabishi": 2
  },
  "initialBoard": {
    "deepAbyssBoard": [
      {
        "templateId": "RELIC_1",
        "name": "Relic Site 1",
        "shapeType": "circle",
        "backgroundColor": "#1c2a38",
        "content": "",
        "changedContent": "💎",
        "changedColor": "#4aaebbff",
        "id": "r0c4",
        "adjacentCellIds": [
          "r1c4",
          "r0c3",
          "r0c5"
        ]
      },
      {
        "templateId": "DANGER",
        "name": "Dangerous Zone",
        "shapeType": "custom",
        "backgroundColor": "#1c2a38",
        "content": "",
        "changedContent": "🌋",
        "customClip": "polygon(50% 0%, 93.3% 25%, 93.3% 75%, 50% 100%, 6.7% 75%, 6.7% 25%)",
        "changedColor": "#ff4500",
        "id": "r2c7",
        "adjacentCellIds": [
          "r1c7",
          "r3c7",
          "r2c6"
        ]
      },
      {
        "templateId": "DANGER",
        "name": "Dangerous Zone",
        "shapeType": "custom",
        "backgroundColor": "#1c2a38",
        "content": "",
        "changedContent": "🌋",
        "customClip": "polygon(50% 0%, 93.3% 25%, 93.3% 75%, 50% 100%, 6.7% 75%, 6.7% 25%)",
        "changedColor": "#ff4500",
        "id": "r3c0",
        "adjacentCellIds": [
          "r2c0",
          "r4c0",
          "r3c1"
        ]
      },
      {
        "templateId": "EMPTY",
        "name": "Empty Deep Sea",
        "shapeType": "square",
        "backgroundColor": "#0d1721",
        "content": "",
        "changedContent": "",
        "changedColor": "#407398",
        "id": "r6c3",
        "adjacentCellIds": [
          "r5c3",
          "r7c3",
          "r6c2",
          "r6c4"
        ]
      },
      {
        "templateId": "EMPTY",
        "name": "Empty Deep Sea",
        "shapeType": "square",
        "backgroundColor": "#0d1721",
        "content": "",
        "changedContent": "",
        "changedColor": "#407398",
        "id": "r4c5",
        "adjacentCellIds": [
          "r3c5",
          "r5c5",
          "r4c4",
          "r4c6"
        ]
      },
      {
        "templateId": "EMPTY",
        "name": "Empty Deep Sea",
        "shapeType": "square",
        "backgroundColor": "#0d1721",
        "content": "",
        "changedContent": "",
        "changedColor": "#407398",
        "id": "r3c6",
        "adjacentCellIds": [
          "r2c6",
          "r4c6",
          "r3c5",
          "r3c7"
        ]
      },
      {
        "templateId": "RELIC_1",
        "name": "Relic Site 1",
        "shapeType": "circle",
        "backgroundColor": "#1c2a38",
        "content": "",
        "changedContent": "💎",
        "changedColor": "#4aaebbff",
        "id": "r0c2",
        "adjacentCellIds": [
          "r1c2",
          "r0c1",
          "r0c3"
        ]
      },
      {
        "templateId": "DANGER",
        "name": "Dangerous Zone",
        "shapeType": "custom",
        "backgroundColor": "#1c2a38",
        "content": "",
        "changedContent": "🌋",
        "customClip": "polygon(50% 0%, 93.3% 25%, 93.3% 75%, 50% 100%, 6.7% 75%, 6.7% 25%)",
        "changedColor": "#ff4500",
        "id": "r3c5",
        "adjacentCellIds": [
          "r2c5",
          "r4c5",
          "r3c4",
          "r3c6"
        ]
      },
      {
        "templateId": "DANGER",
        "name": "Dangerous Zone",
        "shapeType": "custom",
        "backgroundColor": "#1c2a38",
        "content": "",
        "changedContent": "🌋",
        "customClip": "polygon(50% 0%, 93.3% 25%, 93.3% 75%, 50% 100%, 6.7% 75%, 6.7% 25%)",
        "changedColor": "#ff4500",
        "id": "r3c4",
        "adjacentCellIds": [
          "r2c4",
          "r4c4",
          "r3c3",
          "r3c5"
        ]
      },
      {
        "templateId": "EMPTY",
        "name": "Empty Deep Sea",
        "shapeType": "square",
        "backgroundColor": "#0d1721",
        "content": "",
        "changedContent": "",
        "changedColor": "#407398",
        "id": "r4c3",
        "adjacentCellIds": [
          "r3c3",
          "r5c3",
          "r4c2",
          "r4c4"
        ]
      },
      {
        "templateId": "ENERGY",
        "name": "Energy Vein",
        "shapeType": "square",
        "backgroundColor": "#1c2a38",
        "content": "",
        "changedContent": "🫧",
        "changedColor": "#3cb371",
        "id": "r2c4",
        "adjacentCellIds": [
          "r1c4",
          "r3c4",
          "r2c3",
          "r2c5"
        ]
      },
      {
        "templateId": "EMPTY",
        "name": "Empty Deep Sea",
        "shapeType": "square",
        "backgroundColor": "#0d1721",
        "content": "",
        "changedContent": "",
        "changedColor": "#407398",
        "id": "r5c4",
        "adjacentCellIds": [
          "r4c4",
          "r6c4",
          "r5c3",
          "r5c5"
        ]
      },
      {
        "templateId": "ENERGY",
        "name": "Energy Vein",
        "shapeType": "square",
        "backgroundColor": "#1c2a38",
        "content": "",
        "changedContent": "🫧",
        "changedColor": "#3cb371",
        "id": "r2c0",
        "adjacentCellIds": [
          "r1c0",
          "r3c0",
          "r2c1"
        ]
      },
      {
        "templateId": "EMPTY",
        "name": "Empty Deep Sea",
        "shapeType": "square",
        "backgroundColor": "#0d1721",
        "content": "",
        "changedContent": "",
        "changedColor": "#407398",
        "id": "r6c2",
        "adjacentCellIds": [
          "r5c2",
          "r7c2",
          "r6c1",
          "r6c3"
        ]
      },
      {
        "templateId": "RELIC_2",
        "name": "Relic Site 2",
        "shapeType": "square",
        "backgroundColor": "#0d1721",
        "content": "",
        "changedContent": "⚙️",
        "changedColor": "#c0c0c0",
        "id": "r0c7",
        "adjacentCellIds": [
          "r1c7",
          "r0c6"
        ]
      },
      {
        "templateId": "ENERGY",
        "name": "Energy Vein",
        "shapeType": "square",
        "backgroundColor": "#1c2a38",
        "content": "",
        "changedContent": "🫧",
        "changedColor": "#3cb371",
        "id": "r2c1",
        "adjacentCellIds": [
          "r1c1",
          "r3c1",
          "r2c0",
          "r2c2"
        ]
      },
      {
        "templateId": "EMPTY",
        "name": "Empty Deep Sea",
        "shapeType": "square",
        "backgroundColor": "#0d1721",
        "content": "",
        "changedContent": "",
        "changedColor": "#407398",
        "id": "r6c4",
        "adjacentCellIds": [
          "r5c4",
          "r7c4",
          "r6c3",
          "r6c5"
        ]
      },
      {
        "templateId": "RELIC_2",
        "name": "Relic Site 2",
        "shapeType": "square",
        "backgroundColor": "#0d1721",
        "content": "",
        "changedContent": "⚙️",
        "changedColor": "#c0c0c0",
        "id": "r1c1",
        "adjacentCellIds": [
          "r0c1",
          "r2c1",
          "r1c0",
          "r1c2"
        ]
      },
      {
        "templateId": "ABYSS",
        "name": "Abyss Landmark",
        "shapeType": "square",
        "backgroundColor": "#0d1721",
        "content": "",
        "changedContent": "💰",
        "changedColor": "#D4AF37",
        "id": "r7c7",
        "adjacentCellIds": [
          "r6c7",
          "r7c6"
        ]
      },
      {
        "templateId": "EMPTY",
        "name": "Empty Deep Sea",
        "shapeType": "square",
        "backgroundColor": "#0d1721",
        "content": "",
        "changedContent": "",
        "changedColor": "#407398",
        "id": "r5c3",
        "adjacentCellIds": [
          "r4c3",
          "r6c3",
          "r5c2",
          "r5c4"
        ]
      },
      {
        "templateId": "EMPTY",
        "name": "Empty Deep Sea",
        "shapeType": "square",
        "backgroundColor": "#0d1721",
        "content": "",
        "changedContent": "",
        "changedColor": "#407398",
        "id": "r6c5",
        "adjacentCellIds": [
          "r5c5",
          "r7c5",
          "r6c4",
          "r6c6"
        ]
      },
      {
        "templateId": "ABYSS",
        "name": "Abyss Landmark",
        "shapeType": "square",
        "backgroundColor": "#0d1721",
        "content": "",
        "changedContent": "💰",
        "changedColor": "#D4AF37",
        "id": "r7c4",
        "adjacentCellIds": [
          "r6c4",
          "r7c3",
          "r7c5"
        ]
      },
      {
        "templateId": "RELIC_2",
        "name": "Relic Site 2",
        "shapeType": "square",
        "backgroundColor": "#0d1721",
        "content": "",
        "changedContent": "⚙️",
        "changedColor": "#c0c0c0",
        "id": "r1c5",
        "adjacentCellIds": [
          "r0c5",
          "r2c5",
          "r1c4",
          "r1c6"
        ]
      },
      {
        "templateId": "ENERGY",
        "name": "Energy Vein",
        "shapeType": "square",
        "backgroundColor": "#1c2a38",
        "content": "",
        "changedContent": "🫧",
        "changedColor": "#3cb371",
        "id": "r2c6",
        "adjacentCellIds": [
          "r1c6",
          "r3c6",
          "r2c5",
          "r2c7"
        ]
      },
      {
        "templateId": "RELIC_2",
        "name": "Relic Site 2",
        "shapeType": "square",
        "backgroundColor": "#0d1721",
        "content": "",
        "changedContent": "⚙️",
        "changedColor": "#c0c0c0",
        "id": "r1c2",
        "adjacentCellIds": [
          "r0c2",
          "r2c2",
          "r1c1",
          "r1c3"
        ]
      },
      {
        "templateId": "RELIC_2",
        "name": "Relic Site 2",
        "shapeType": "square",
        "backgroundColor": "#0d1721",
        "content": "",
        "changedContent": "⚙️",
        "changedColor": "#c0c0c0",
        "id": "r1c0",
        "adjacentCellIds": [
          "r0c0",
          "r2c0",
          "r1c1"
        ]
      },
      {
        "templateId": "RELIC_2",
        "name": "Relic Site 2",
        "shapeType": "square",
        "backgroundColor": "#0d1721",
        "content": "",
        "changedContent": "⚙️",
        "changedColor": "#c0c0c0",
        "id": "r0c6",
        "adjacentCellIds": [
          "r1c6",
          "r0c5",
          "r0c7"
        ]
      },
      {
        "templateId": "EMPTY",
        "name": "Empty Deep Sea",
        "shapeType": "square",
        "backgroundColor": "#0d1721",
        "content": "",
        "changedContent": "",
        "changedColor": "#407398",
        "id": "r3c7",
        "adjacentCellIds": [
          "r2c7",
          "r4c7",
          "r3c6"
        ]
      },
      {
        "templateId": "EMPTY",
        "name": "Empty Deep Sea",
        "shapeType": "square",
        "backgroundColor": "#0d1721",
        "content": "",
        "changedContent": "",
        "changedColor": "#407398",
        "id": "r7c1",
        "adjacentCellIds": [
          "r6c1",
          "r7c0",
          "r7c2"
        ]
      },
      {
        "templateId": "EMPTY",
        "name": "Empty Deep Sea",
        "shapeType": "square",
        "backgroundColor": "#0d1721",
        "content": "",
        "changedContent": "",
        "changedColor": "#407398",
        "id": "r6c1",
        "adjacentCellIds": [
          "r5c1",
          "r7c1",
          "r6c0",
          "r6c2"
        ]
      },
      {
        "templateId": "EMPTY",
        "name": "Empty Deep Sea",
        "shapeType": "square",
        "backgroundColor": "#0d1721",
        "content": "",
        "changedContent": "",
        "changedColor": "#407398",
        "id": "r5c0",
        "adjacentCellIds": [
          "r4c0",
          "r6c0",
          "r5c1"
        ]
      },
      {
        "templateId": "RELIC_1",
        "name": "Relic Site 1",
        "shapeType": "circle",
        "backgroundColor": "#1c2a38",
        "content": "",
        "changedContent": "💎",
        "changedColor": "#4aaebbff",
        "id": "r0c3",
        "adjacentCellIds": [
          "r1c3",
          "r0c2",
          "r0c4"
        ]
      },
      {
        "templateId": "ENERGY",
        "name": "Energy Vein",
        "shapeType": "square",
        "backgroundColor": "#1c2a38",
        "content": "",
        "changedContent": "🫧",
        "changedColor": "#3cb371",
        "id": "r2c2",
        "adjacentCellIds": [
          "r1c2",
          "r3c2",
          "r2c1",
          "r2c3"
        ]
      },
      {
        "templateId": "ENERGY",
        "name": "Energy Vein",
        "shapeType": "square",
        "backgroundColor": "#1c2a38",
        "content": "",
        "changedContent": "🫧",
        "changedColor": "#3cb371",
        "id": "r2c5",
        "adjacentCellIds": [
          "r1c5",
          "r3c5",
          "r2c4",
          "r2c6"
        ]
      },
      {
        "templateId": "EMPTY",
        "name": "Empty Deep Sea",
        "shapeType": "square",
        "backgroundColor": "#0d1721",
        "content": "",
        "changedContent": "",
        "changedColor": "#407398",
        "id": "r5c5",
        "adjacentCellIds": [
          "r4c5",
          "r6c5",
          "r5c4",
          "r5c6"
        ]
      },
      {
        "templateId": "EMPTY",
        "name": "Empty Deep Sea",
        "shapeType": "square",
        "backgroundColor": "#0d1721",
        "content": "",
        "changedContent": "",
        "changedColor": "#407398",
        "id": "r4c2",
        "adjacentCellIds": [
          "r3c2",
          "r5c2",
          "r4c1",
          "r4c3"
        ]
      },
      {
        "templateId": "RELIC_2",
        "name": "Relic Site 2",
        "shapeType": "square",
        "backgroundColor": "#0d1721",
        "content": "",
        "changedContent": "⚙️",
        "changedColor": "#c0c0c0",
        "id": "r1c3",
        "adjacentCellIds": [
          "r0c3",
          "r2c3",
          "r1c2",
          "r1c4"
        ]
      },
      {
        "templateId": "ABYSS",
        "name": "Abyss Landmark",
        "shapeType": "square",
        "backgroundColor": "#0d1721",
        "content": "",
        "changedContent": "💰",
        "changedColor": "#D4AF37",
        "id": "r7c6",
        "adjacentCellIds": [
          "r6c6",
          "r7c5",
          "r7c7"
        ]
      },
      {
        "templateId": "ABYSS",
        "name": "Abyss Landmark",
        "shapeType": "square",
        "backgroundColor": "#0d1721",
        "content": "",
        "changedContent": "💰",
        "changedColor": "#D4AF37",
        "id": "r7c5",
        "adjacentCellIds": [
          "r6c5",
          "r7c4",
          "r7c6"
        ]
      },
      {
        "templateId": "EMPTY",
        "name": "Empty Deep Sea",
        "shapeType": "square",
        "backgroundColor": "#0d1721",
        "content": "",
        "changedContent": "",
        "changedColor": "#407398",
        "id": "r6c0",
        "adjacentCellIds": [
          "r5c0",
          "r7c0",
          "r6c1"
        ]
      },
      {
        "templateId": "DANGER",
        "name": "Dangerous Zone",
        "shapeType": "custom",
        "backgroundColor": "#1c2a38",
        "content": "",
        "changedContent": "🌋",
        "customClip": "polygon(50% 0%, 93.3% 25%, 93.3% 75%, 50% 100%, 6.7% 75%, 6.7% 25%)",
        "changedColor": "#ff4500",
        "id": "r3c3",
        "adjacentCellIds": [
          "r2c3",
          "r4c3",
          "r3c2",
          "r3c4"
        ]
      },
      {
        "templateId": "RELIC_2",
        "name": "Relic Site 2",
        "shapeType": "square",
        "backgroundColor": "#0d1721",
        "content": "",
        "changedContent": "⚙️",
        "changedColor": "#c0c0c0",
        "id": "r1c4",
        "adjacentCellIds": [
          "r0c4",
          "r2c4",
          "r1c3",
          "r1c5"
        ]
      },
      {
        "templateId": "EMPTY",
        "name": "Empty Deep Sea",
        "shapeType": "square",
        "backgroundColor": "#0d1721",
        "content": "",
        "changedContent": "",
        "changedColor": "#407398",
        "id": "r7c2",
        "adjacentCellIds": [
          "r6c2",
          "r7c1",
          "r7c3"
        ]
      },
      {
        "templateId": "EMPTY",
        "name": "Empty Deep Sea",
        "shapeType": "square",
        "backgroundColor": "#0d1721",
        "content": "",
        "changedContent": "",
        "changedColor": "#407398",
        "id": "r6c7",
        "adjacentCellIds": [
          "r5c7",
          "r7c7",
          "r6c6"
        ]
      },
      {
        "templateId": "ENERGY",
        "name": "Energy Vein",
        "shapeType": "square",
        "backgroundColor": "#1c2a38",
        "content": "",
        "changedContent": "🫧",
        "changedColor": "#3cb371",
        "id": "r2c3",
        "adjacentCellIds": [
          "r1c3",
          "r3c3",
          "r2c2",
          "r2c4"
        ]
      },
      {
        "templateId": "EMPTY",
        "name": "Empty Deep Sea",
        "shapeType": "square",
        "backgroundColor": "#0d1721",
        "content": "",
        "changedContent": "",
        "changedColor": "#407398",
        "id": "r4c7",
        "adjacentCellIds": [
          "r3c7",
          "r5c7",
          "r4c6"
        ]
      },
      {
        "templateId": "EMPTY",
        "name": "Empty Deep Sea",
        "shapeType": "square",
        "backgroundColor": "#0d1721",
        "content": "",
        "changedContent": "",
        "changedColor": "#407398",
        "id": "r4c4",
        "adjacentCellIds": [
          "r3c4",
          "r5c4",
          "r4c3",
          "r4c5"
        ]
      },
      {
        "templateId": "EMPTY",
        "name": "Empty Deep Sea",
        "shapeType": "square",
        "backgroundColor": "#0d1721",
        "content": "",
        "changedContent": "",
        "changedColor": "#407398",
        "id": "r7c0",
        "adjacentCellIds": [
          "r6c0",
          "r7c1"
        ]
      },
      {
        "templateId": "RELIC_1",
        "name": "Relic Site 1",
        "shapeType": "circle",
        "backgroundColor": "#1c2a38",
        "content": "",
        "changedContent": "💎",
        "changedColor": "#4aaebbff",
        "id": "r0c1",
        "adjacentCellIds": [
          "r1c1",
          "r0c0",
          "r0c2"
        ]
      },
      {
        "templateId": "RELIC_2",
        "name": "Relic Site 2",
        "shapeType": "square",
        "backgroundColor": "#0d1721",
        "content": "",
        "changedContent": "⚙️",
        "changedColor": "#c0c0c0",
        "id": "r0c5",
        "adjacentCellIds": [
          "r1c5",
          "r0c4",
          "r0c6"
        ]
      },
      {
        "templateId": "EMPTY",
        "name": "Empty Deep Sea",
        "shapeType": "square",
        "backgroundColor": "#0d1721",
        "content": "",
        "changedContent": "",
        "changedColor": "#407398",
        "id": "r6c6",
        "adjacentCellIds": [
          "r5c6",
          "r7c6",
          "r6c5",
          "r6c7"
        ]
      },
      {
        "templateId": "EMPTY",
        "name": "Empty Deep Sea",
        "shapeType": "square",
        "backgroundColor": "#0d1721",
        "content": "",
        "changedContent": "",
        "changedColor": "#407398",
        "id": "r5c2",
        "adjacentCellIds": [
          "r4c2",
          "r6c2",
          "r5c1",
          "r5c3"
        ]
      },
      {
        "templateId": "RELIC_1",
        "name": "Relic Site 1",
        "shapeType": "circle",
        "backgroundColor": "#1c2a38",
        "content": "",
        "changedContent": "💎",
        "changedColor": "#4aaebbff",
        "id": "r0c0",
        "adjacentCellIds": [
          "r1c0",
          "r0c1"
        ]
      },
      {
        "templateId": "EMPTY",
        "name": "Empty Deep Sea",
        "shapeType": "square",
        "backgroundColor": "#0d1721",
        "content": "",
        "changedContent": "",
        "changedColor": "#407398",
        "id": "r5c1",
        "adjacentCellIds": [
          "r4c1",
          "r6c1",
          "r5c0",
          "r5c2"
        ]
      },
      {
        "templateId": "EMPTY",
        "name": "Empty Deep Sea",
        "shapeType": "square",
        "backgroundColor": "#0d1721",
        "content": "",
        "changedContent": "",
        "changedColor": "#407398",
        "id": "r4c0",
        "adjacentCellIds": [
          "r3c0",
          "r5c0",
          "r4c1"
        ]
      },
      {
        "templateId": "ABYSS",
        "name": "Abyss Landmark",
        "shapeType": "square",
        "backgroundColor": "#0d1721",
        "content": "",
        "changedContent": "💰",
        "changedColor": "#D4AF37",
        "id": "r7c3",
        "adjacentCellIds": [
          "r6c3",
          "r7c2",
          "r7c4"
        ]
      },
      {
        "templateId": "EMPTY",
        "name": "Empty Deep Sea",
        "shapeType": "square",
        "backgroundColor": "#0d1721",
        "content": "",
        "changedContent": "",
        "changedColor": "#407398",
        "id": "r5c7",
        "adjacentCellIds": [
          "r4c7",
          "r6c7",
          "r5c6"
        ]
      },
      {
        "templateId": "ENERGY",
        "name": "Energy Vein",
        "shapeType": "square",
        "backgroundColor": "#1c2a38",
        "content": "",
        "changedContent": "🫧",
        "changedColor": "#3cb371",
        "id": "r1c7",
        "adjacentCellIds": [
          "r0c7",
          "r2c7",
          "r1c6"
        ]
      },
      {
        "templateId": "EMPTY",
        "name": "Empty Deep Sea",
        "shapeType": "square",
        "backgroundColor": "#0d1721",
        "content": "",
        "changedContent": "",
        "changedColor": "#407398",
        "id": "r4c1",
        "adjacentCellIds": [
          "r3c1",
          "r5c1",
          "r4c0",
          "r4c2"
        ]
      },
      {
        "templateId": "EMPTY",
        "name": "Empty Deep Sea",
        "shapeType": "square",
        "backgroundColor": "#0d1721",
        "content": "",
        "changedContent": "",
        "changedColor": "#407398",
        "id": "r5c6",
        "adjacentCellIds": [
          "r4c6",
          "r6c6",
          "r5c5",
          "r5c7"
        ]
      },
      {
        "templateId": "DANGER",
        "name": "Dangerous Zone",
        "shapeType": "custom",
        "backgroundColor": "#1c2a38",
        "content": "",
        "changedContent": "🌋",
        "customClip": "polygon(50% 0%, 93.3% 25%, 93.3% 75%, 50% 100%, 6.7% 75%, 6.7% 25%)",
        "changedColor": "#ff4500",
        "id": "r3c1",
        "adjacentCellIds": [
          "r2c1",
          "r4c1",
          "r3c0",
          "r3c2"
        ]
      },
      {
        "templateId": "RELIC_2",
        "name": "Relic Site 2",
        "shapeType": "square",
        "backgroundColor": "#0d1721",
        "content": "",
        "changedContent": "⚙️",
        "changedColor": "#c0c0c0",
        "id": "r1c6",
        "adjacentCellIds": [
          "r0c6",
          "r2c6",
          "r1c5",
          "r1c7"
        ]
      },
      {
        "templateId": "EMPTY",
        "name": "Empty Deep Sea",
        "shapeType": "square",
        "backgroundColor": "#0d1721",
        "content": "",
        "changedContent": "",
        "changedColor": "#407398",
        "id": "r4c6",
        "adjacentCellIds": [
          "r3c6",
          "r5c6",
          "r4c5",
          "r4c7"
        ]
      },
      {
        "templateId": "DANGER",
        "name": "Dangerous Zone",
        "shapeType": "custom",
        "backgroundColor": "#1c2a38",
        "content": "",
        "changedContent": "🌋",
        "customClip": "polygon(50% 0%, 93.3% 25%, 93.3% 75%, 50% 100%, 6.7% 75%, 6.7% 25%)",
        "changedColor": "#ff4500",
        "id": "r3c2",
        "adjacentCellIds": [
          "r2c2",
          "r4c2",
          "r3c1",
          "r3c3"
        ]
      }
    ]
  },
  "initialTokensOnBoard": {
    "piece": [
      {
        "id": "piece",
        "name": "piece",
        "ownerId": "player",
        "color": "#ff4444",
        "position": {
          "row": 2,
          "col": 3
        },
        "image": "/hanabishi.svg"
      }
    ],
    "piece-2": [
      {
        "id": "piece-2",
        "name": "piece-2",
        "ownerId": "player",
        "color": "#ff4444",
        "position": {
          "row": 2,
          "col": 3
        },
        "image": "/hanabishi.svg"
      }
    ],
    "item-treasure": [
      {
        "id": "item-treasure",
        "name": "敵",
        "ownerId": null,
        "color": "#ffd700",
        "position": {
          "row": 5,
          "col": 5
        }
      }
    ],
    "enemy-boss": [
      {
        "id": "enemy-boss",
        "name": "敵",
        "ownerId": null,
        "color": "#8b0000",
        "position": {
          "row": 0,
          "col": 0
        }
      }
    ]
  },
  "initialPhase": {
    "name": "start"
  },
  "components": []
};