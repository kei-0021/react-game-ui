// src/index.ts

// コンポーネントは JS 実体に .js をつける
export { Cell } from './components/Cell.js';
export { default as Deck } from './components/Deck.js';
export { default as Dice } from './components/Dice.js';
export { default as GridBoard } from './components/GridBoard.js';
export { default as PlayField } from './components/PlayField.js';
export { default as ScoreBoard } from './components/ScoreBoard.js';
export { default as Timer } from './components/Timer.js';
export { default as TokenStore } from './components/TokenStore.js';

// 型は拡張子なしで書く
// 型（警告を無視）
/* @ts-ignore */
export * from './types/card';
/* @ts-ignore */
export type { CardEffectParams } from './types/cardEffectParams';
/* @ts-ignore */
export * from './types/cardLocation';
/* @ts-ignore */
export type { CellEffectParams } from './types/cellEffectParams';
/* @ts-ignore */
export * from './types/definition';
/* @ts-ignore */
export * from './types/player';
/* @ts-ignore */
export type { PlayerWithResources } from './types/playerWithResources';
/* @ts-ignore */
export type { PieceData } from './types/piece';

