#!/usr/bin/env node
// src/cli/index.ts

const command = process.argv[2];

switch (command) {
  case 'gen':
    // 生成ロジック
    import('./generate-new-game.js');
    console.log('Generating...');
    break;
  case 'del':
    // 削除ロジック
    import('./delete-game.js');
    break;
  default:
    console.log('Usage: rg-ui <command> <gameName>');
    process.exit(1);
}
