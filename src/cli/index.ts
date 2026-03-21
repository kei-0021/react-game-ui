#!/usr/bin/env node
// src/cli/index.ts

const command = process.argv[2];
const gameName = process.argv[3];
const gameIcon = process.argv[4] || '🎲';

const handleError = (err: any) => {
  console.error('[Error]', err.message || err);
  process.exit(1);
};

switch (command) {
  case 'init':
    console.log('Initializing...');
    import('./init.js')
      .then((m) => {
        m.init();
        console.log('Done.');
      })
      .catch(handleError);
    break;

  case 'gen':
    if (!gameName) {
      console.error('Usage: rg-ui gen <name> [icon]');
      process.exit(1);
    }
    console.log(`Generating: ${gameName}`);
    import('./generate-new-game.js')
      .then((m) => {
        m.generate(gameName, gameIcon);
        console.log('Done.');
      })
      .catch(handleError);
    break;

  case 'del':
    if (!gameName) {
      console.error('Usage: rg-ui del <name>');
      process.exit(1);
    }
    console.log(`Deleting: ${gameName}`);
    import('./delete-game.js')
      .then((m) => {
        m.remove(gameName);
        console.log('Done.');
      })
      .catch(handleError);
    break;

  default:
    console.log('Usage:');
    console.log('  rg-ui init');
    console.log('  rg-ui gen <name> <icon>');
    console.log('  rg-ui del <name>');
    process.exit(1);
}
