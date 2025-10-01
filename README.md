# react-game-ui
## パッケージインストール方法
```
npm install github:kei-0021/react-game-ui
```

## サーバーの起動方法
- package.jsonに事前に以下の記載をしておいてください。
```
"scripts": {
    "server": "node node_modules/react-game-ui/server.js",
    "dev:multi": "concurrently \"npm run server\" \"vite\"",
}
```
- 以下のコマンドでクライアントとサーバーを同時に起動し、複数人同時プレイができます。
- 内部的に `socket.io` を利用しています。
```
npm run dev:multi
```

## 機能
- スコアボード (ScoreBoard)
- 山札 & カード (Deck)
- サイコロ (Dice)
- タイマー (Timer)