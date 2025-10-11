# react-game-ui
## パッケージインストール方法
```
npm install github:kei-0021/react-game-ui
```

## サーバーの起動方法
- server.jsの`GameServer`を取り込んで、必要な設定をしてください。
```tsx
const demoServer = new GameServer({
  port: 4000,
  clientDistPath: path.resolve("./tests"),
  libDistPath: path.resolve("../dist"),
  corsOrigins: ["http://localhost:5173", "http://localhost:4000"],
  onServerStart: (url) => {
    console.log(`🎮 Demo server running at: ${url}`);
  },
  initialDecks,
  cardEffects
});

// サーバー起動
demoServer.start();
```
- package.jsonに事前に以下の記載をしておいてください。
```
"scripts": {
    "server": "node ./pass/to/your/server.js",
    "dev:multi": "concurrently \"npm run server\" \"vite --host\"",
}
```
- 以下のコマンドでクライアントとサーバーを同時に起動し、複数人同時プレイができます。
- 内部的に `socket.io` を利用しています。
```
pnpm run dev multi
```

## 各種コンポーネント
- スコアボード (ScoreBoard)
  - 山札から引いたカードを手札にする場合、こちらで管理します。
```tsx
<ScoreBoard
  socket={socket}
  players={players}
  currentPlayerId={currentPlayerId}
  myPlayerId={myPlayerId}
/>
```
- 山札 & カード (Deck)
  - JSON形式でインポートし、`socket.io` でサーバー側に直接渡して登録します。
  - カードに効果を持たせることも可能です。
```
[
  {
    "id": "card-001",
    "name": "ファイアボール",
    "description": "敵に大ダメージを与える炎の魔法。",
    "location": "deck",
    "drawLocation": "hand",
    "playLocation": "field"
  },
  {
    "id": "card-002",
    "name": "ヒーリング",
    "description": "味方を回復させる光の魔法。",
    "location": "deck",
    "drawLocation": "hand",
    "playLocation": "field"
  },
]
```
```ts
type CardEffectParams = {
  playerId?: string;
  addScore: (playerId: string, points: number) => void;
};

export const cardEffects: Record<string, (params: CardEffectParams) => void> = {
  "ファイアボール": ({ playerId, addScore }) => {
    console.log(`🔥 ファイアボール発動! by ${playerId}`);
    if (playerId) addScore(playerId, 3);
  },
  "ヒーリング": ({ playerId, addScore }) => {
    console.log(`✨ ヒーリング発動! by ${playerId}`);
    if (playerId) addScore(playerId, 2);
  },
};
```
```js
const initialDecks = [
  { deckId: "fantasy", name: "ファンタジーカード", cards: fantasyDeckJson, backColor: "#c25656ff" },
];

const demoServer = new GameServer({
  ...
  initialDecks,
  cardEffects
});
```
```tsx
<Deck socket={socket} deckId="fantasy" name="ファンタジーカード" playerId={currentPlayerId} />
```
- サイコロ (Dice)
```tsx
// コンポーネントとして配置
<DiceSocket socket={socket} diceId="0" sides={6} />
```
- タイマー (Timer)
```tsx
// コンポーネントとして配置
<Timer socket={socket} onFinish={() => console.log("タイマー終了！")} />
```