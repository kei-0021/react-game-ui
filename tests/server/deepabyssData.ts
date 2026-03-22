export const deepabyssData: any = {
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
          "name": "💰",
          "color": "#D4AF37"
        },
        {
          "id": "ARTIFACT-s2",
          "name": "💰",
          "color": "#D4AF37"
        },
        {
          "id": "ARTIFACT-s3",
          "name": "💰",
          "color": "#D4AF37"
        },
        {
          "id": "ARTIFACT-s4",
          "name": "💰",
          "color": "#D4AF37"
        },
        {
          "id": "ARTIFACT-s5",
          "name": "💰",
          "color": "#D4AF37"
        },
        {
          "id": "ARTIFACT-s6",
          "name": "💰",
          "color": "#D4AF37"
        },
        {
          "id": "ARTIFACT-s7",
          "name": "💰",
          "color": "#D4AF37"
        },
        {
          "id": "ARTIFACT-s8",
          "name": "💰",
          "color": "#D4AF37"
        },
        {
          "id": "ARTIFACT-s9",
          "name": "💰",
          "color": "#D4AF37"
        },
        {
          "id": "ARTIFACT-s10",
          "name": "💰",
          "color": "#D4AF37"
        },
        {
          "id": "ARTIFACT-s11",
          "name": "💰",
          "color": "#D4AF37"
        },
        {
          "id": "ARTIFACT-s12",
          "name": "💰",
          "color": "#D4AF37"
        },
        {
          "id": "ARTIFACT-s13",
          "name": "💰",
          "color": "#D4AF37"
        },
        {
          "id": "ARTIFACT-s14",
          "name": "💰",
          "color": "#D4AF37"
        },
        {
          "id": "ARTIFACT-s15",
          "name": "💰",
          "color": "#D4AF37"
        },
        {
          "id": "ARTIFACT-s16",
          "name": "💰",
          "color": "#D4AF37"
        },
        {
          "id": "ARTIFACT-s17",
          "name": "💰",
          "color": "#D4AF37"
        },
        {
          "id": "ARTIFACT-s18",
          "name": "💰",
          "color": "#D4AF37"
        },
        {
          "id": "ARTIFACT-s19",
          "name": "💰",
          "color": "#D4AF37"
        },
        {
          "id": "ARTIFACT-s20",
          "name": "💰",
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
          "name": "🎆",
          "imageSrc": "/hanabishi.svg",
          "color": "#d43737"
        },
        {
          "id": "花火師-s2",
          "name": "🎆",
          "imageSrc": "/hanabishi.svg",
          "color": "#d43737"
        },
        {
          "id": "花火師-s3",
          "name": "🎆",
          "imageSrc": "/hanabishi.svg",
          "color": "#d43737"
        },
        {
          "id": "花火師-s4",
          "name": "🎆",
          "imageSrc": "/hanabishi.svg",
          "color": "#d43737"
        },
        {
          "id": "花火師-s5",
          "name": "🎆",
          "imageSrc": "/hanabishi.svg",
          "color": "#d43737"
        },
        {
          "id": "花火師-s6",
          "name": "🎆",
          "imageSrc": "/hanabishi.svg",
          "color": "#d43737"
        },
        {
          "id": "花火師-s7",
          "name": "🎆",
          "imageSrc": "/hanabishi.svg",
          "color": "#d43737"
        },
        {
          "id": "花火師-s8",
          "name": "🎆",
          "imageSrc": "/hanabishi.svg",
          "color": "#d43737"
        },
        {
          "id": "花火師-s9",
          "name": "🎆",
          "imageSrc": "/hanabishi.svg",
          "color": "#d43737"
        },
        {
          "id": "花火師-s10",
          "name": "🎆",
          "imageSrc": "/hanabishi.svg",
          "color": "#d43737"
        },
        {
          "id": "花火師-s11",
          "name": "🎆",
          "imageSrc": "/hanabishi.svg",
          "color": "#d43737"
        },
        {
          "id": "花火師-s12",
          "name": "🎆",
          "imageSrc": "/hanabishi.svg",
          "color": "#d43737"
        },
        {
          "id": "花火師-s13",
          "name": "🎆",
          "imageSrc": "/hanabishi.svg",
          "color": "#d43737"
        },
        {
          "id": "花火師-s14",
          "name": "🎆",
          "imageSrc": "/hanabishi.svg",
          "color": "#d43737"
        },
        {
          "id": "花火師-s15",
          "name": "🎆",
          "imageSrc": "/hanabishi.svg",
          "color": "#d43737"
        },
        {
          "id": "花火師-s16",
          "name": "🎆",
          "imageSrc": "/hanabishi.svg",
          "color": "#d43737"
        },
        {
          "id": "花火師-s17",
          "name": "🎆",
          "imageSrc": "/hanabishi.svg",
          "color": "#d43737"
        },
        {
          "id": "花火師-s18",
          "name": "🎆",
          "imageSrc": "/hanabishi.svg",
          "color": "#d43737"
        },
        {
          "id": "花火師-s19",
          "name": "🎆",
          "imageSrc": "/hanabishi.svg",
          "color": "#d43737"
        },
        {
          "id": "花火師-s20",
          "name": "🎆",
          "imageSrc": "/hanabishi.svg",
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
    "deepAbyssAction": 5
  },
  "initialTokens": {
    "ARTIFACT": 3,
    "Hanabishi": 3
  },
  "pieceImage": "/hanabishi.svg",
  "initialPhase": {
    "name": "start"
  }
};