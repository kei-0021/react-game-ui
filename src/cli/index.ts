#!/usr/bin/env node
// src/cli/index.ts

const command = process.argv[2];
const gameName = process.argv[3];
const gameIcon = process.argv[4] || '🎲';

switch (command) {
  case 'gen':
    console.log('Generating...');
    // importして、エクスポートされた関数を直接呼ぶ
    import('./generate-new-game.js')
      .then((m) => {
        m.generate(gameName, gameIcon);
      })
      .catch((err) => {
        console.error('エラーが発生しました:', err);
      });
    break;
  case 'del':
    // 削除ロジック
    import('./delete-game.js')
      .then((m) => {
        m.remove(gameName);
      })
      .catch((err) => {
        console.error('エラーが発生しました:', err);
      });
    break;
  default:
    console.log('Usage: rg-ui <command> <gameName>');
    process.exit(1);
}
