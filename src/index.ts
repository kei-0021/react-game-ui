// src/index.ts

// コンポーネントは JS 実体に .js をつける
export { Cell } from './components/Cell.js';
export { Deck } from './components/Deck.js';
export { Dice } from './components/Dice.js';
export { Draggable } from './components/Draggable.js';
export { GridBoard } from './components/GridBoard.js';
export { PlayField } from './components/PlayField.js';
export { RemoteCursor } from './components/RemoteCursor.js';
export { ScoreBoard } from './components/ScoreBoard.js';
export { SystemMessageWindow } from './components/systemMessageWindow.js';
export { default as Timer } from './components/Timer.js';
export { TokenStore } from './components/TokenStore.js';

// 型（警告を無視）
/* @ts-ignore */
export * from './types/card.js';
/* @ts-ignore */
export { type CardEffectParams } from './types/cardEffectParams.js';
/* @ts-ignore */
export * from './types/cardLocation.js';
/* @ts-ignore */
export * from './types/definition.js';
/* @ts-ignore */
export * from './types/player.js';
/* @ts-ignore */
export { type PieceData } from './types/piece.js';
/* @ts-ignore */
export { type DraggableData } from './types/draggable.js';
/* @ts-ignore */
export { RoomManager } from './server/server-utils.js';
/* @ts-ignore */
export { type GameParam, type RoomState } from './types/server.js';
/* @ts-ignore */
export { type CellData } from './types/cell.js';
/* @ts-ignore */
export { Phase } from './types/phase.js';
/* @ts-ignore */
export { ControlPanel } from './components/ControlPanel.js';
/* @ts-ignore */
export {
  type CardPlayData,
  type DeckDrawData,
  type GameMeta,
  type GamePhaseUpdateData,
  type GameTurnUpdateData,
  type LobbyList as LobbyRoomsList,
  type RoomJoinData,
  type RoomMeta,
} from './types/socketData.js';
