# react-game-ui
## パッケージインストール方法
```
npm install github:kei-0021/react-game-ui
```

## サーバーの起動方法
- package.jsonに事前に以下の記載をしておいてください。
```
"scripts": {
    "server": "node ./src/server.js",
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
  - JSON形式でインポートし、`socket.io` でサーバー側に配信して登録します。
  - カードに効果を持たせることも可能です。
```
[
  {
    "id": "card-001",
    "name": "ファイアボール",
    "description": "敵に大ダメージを与える炎の魔法。",
    "location": "deck"
  },
  {
    "id": "card-002",
    "name": "ヒーリング",
    "description": "味方を回復させる光の魔法。",
    "location": "hand"
  }
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
```tsx
// デッキを登録
allDecks.forEach(deck => socket.emit("deck:add", deck));

// コンポーネントとして配置
<Deck socket={socket} deckId="main" name="イベントカード" playerId={currentPlayerId} />
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