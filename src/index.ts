// src/index.ts

// コンポーネントは JS 実体に .js をつける
export { Cell } from './components/Cell.js';
export { Deck } from './components/Deck.js';
export { default as Dice } from './components/Dice.js';
export { Draggable } from './components/Draggable.js';
export { default as GridBoard } from './components/GridBoard.js';
export { PlayField } from './components/PlayField.js';
export { RemoteCursor } from './components/RemoteCursor.js';
export { ScoreBoard } from './components/ScoreBoard.js';
export { default as Timer } from './components/Timer.js';
export { default as TokenStore } from './components/TokenStore.js';

// 型（警告を無視）
/* @ts-ignore */
export * from './types/card.js';
/* @ts-ignore */
export { type CardEffectParams } from './types/cardEffectParams.js';
/* @ts-ignore */
export * from './types/cardLocation.js';
/* @ts-ignore */
export { type CellEffectParams } from './types/cellEffectParams.js';
/* @ts-ignore */
export * from './types/definition.js';
/* @ts-ignore */
export * from './types/player.js';
/* @ts-ignore */
export { type PieceData } from './types/piece.js';
/* @ts-ignore */
export { type RoomMeta, type RoomParam, type RoomState } from './types/server.js';
/* @ts-ignore */
export { type GameTurnUpdateData, type RoomJoinData, type RoomMeta } from './types/socketData.js';
