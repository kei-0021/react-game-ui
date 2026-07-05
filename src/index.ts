// src/index.ts

// コンポーネントは JS 実体に .js をつける
export { Cell } from './components/Board/Cell.js';
export { GridBoard } from './components/Board/GridBoard.js';
export { Deck } from './components/Deck.js';
export { Dice } from './components/Dice.js';
export { Draggable } from './components/Draggable.js';
export { PlayField } from './components/PlayField.js';
export { RemoteCursor } from './components/RemoteCursor.js';
export { ScoreBoard } from './components/ScoreBoard/ScoreBoard.js';
export { SystemMessageWindow } from './components/SystemMessageWindow.js';
export { Timer } from './components/Timer.js';
export { TokenStore } from './components/TokenStore.js';
export { DynamicComponent } from './dynamic/DynamicComponent.js';
export { ControlPanel } from './gui/ControlPanel.js';

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
export { type DraggableData } from './types/draggable.js';
/* @ts-ignore */
export { type ComponentInfo } from './types/component.js';
/* @ts-ignore */
export { RoomManager } from './server/room-manager.js';
/* @ts-ignore */
export { type GameParam } from './types/gameParam.js';
/* @ts-ignore */
export { type RoomState } from './types/roomState.js';
/* @ts-ignore */
export { type CellData } from './types/cell.js';
/* @ts-ignore */
export { Phase } from './types/phase.js';
/* @ts-ignore */
export { useSocket } from './hooks/useSocket.js';
/* @ts-ignore */
export {
  type CardPlayData,
  type DeckDrawData,
  type GameTurnUpdateData,
  type LobbyGameList,
  type LobbyRoomList,
  type PhaseUpdateData,
  type RoomJoinData,
  type RoomMeta,
} from './types/socketData.js';
