// src/types/socketData.ts

import type { CardData } from './card.js';
import type { CardLocation } from './cardLocation.js';
import type { CardState } from './cardState.js';
import type { CellData } from './cell.js';
import type { ComponentInfo } from './component.js';
import type { Coordinate } from './coodinate.js';
import type {
  BoardId,
  CardId,
  DeckId,
  DiceId,
  DraggableId,
  GameId,
  PlayerId,
  RoomId,
  TokenId,
  TokenStoreId,
} from './definition.js';
import type { GameParam } from './gameParam.js';
import type { Phase } from './phase.js';
import { Position } from './position.js';
import type { RoomState } from './roomState.js';
import type { TokenData } from './token.js';

/*
 * ===========================================
 * ゲーム・ルーム情報
 * ===========================================
 */

export type RoomMeta = {
  id: RoomId;
  gameId: GameId;
  playerCount: number;
  maxPlayers?: number;
  createdAt: number;
};

export type LobbyGameList = {
  games: GameParam[];
};

export type LobbyRoomList = {
  rooms: RoomMeta[];
};

export interface GameComponentData {
  state: RoomState;
  components: ComponentInfo[];
}

export type RoomJoinData = {
  roomId: RoomId;
  gameId: GameId;
  playerName: PlayerId;
};

/*
 * ===========================================
 * ゲーム追加・削除・更新
 * ===========================================
 */
export type GameCreateData = {
  gameName: string;
  gameIcon: string;
};

export type GameDeleteData = {
  gameId: GameId;
};

export type GameParamUpdateData = {
  gameId: GameId;
  newParam: Partial<GameParam>;
};

/*
 * ===========================================
 * カード・デッキ操作関連
 * ===========================================
 */
export type DeckDrawData = {
  roomId: RoomId;
  deckId: DeckId;
  playerId?: PlayerId | null;
  drawCondition: [CardLocation, CardState];
};

export type DeckShuffleData = {
  roomId: RoomId;
  deckId: DeckId;
};

export type DeckResetData = {
  roomId: RoomId;
  deckId: DeckId;
};

export type DeckUpdateData = {
  currentDeck: CardData[];
  playFieldCards: CardData[];
  discardPile: CardData[];
};

export type CardPlayData = {
  roomId: RoomId;
  deckId: DeckId;
  cardIds: CardId[];
  playerId: PlayerId;
  playLocation: CardLocation;
  coordinate: Coordinate;
};

export type CardHoldData = {
  roomId: RoomId;
  playerId: PlayerId;
  cardIdsbyDeck: Record<DeckId, CardId[]>;
};

export type CardFlipData = {
  roomId: RoomId;
  playerId: PlayerId;
  cardIds: CardId[];
};

export type CardMoveOnFieldData = {
  roomId: RoomId;
  deckId: DeckId;
  cardId: string;
  coordinate?: Coordinate;
  zIndex?: number;
  rotation?: number;
};

export type CardMoveFromFieldData = {
  roomId: RoomId;
  deckId: DeckId;
  cardId: string;
  playerId?: PlayerId | null;
};

/*
 * ===========================================
 * トークン関連
 * ===========================================
 */

export type TokenStoreUpdateData = {
  tokenStore: TokenData[];
};

export type TokenAcquireData = {
  roomId: RoomId;
  tokenStoreId: TokenStoreId;
  tokenId: TokenId;
};

export type TokenMovableRangeData = {
  roomId: RoomId;
  boardId: BoardId;
  playerId: PlayerId;
  moveRange: number;
  isExact: boolean;
};

export type TokenPlayData = {
  roomId: RoomId;
  boardId: BoardId;
  tokenId: TokenId;
  playerId: PlayerId;
  newPosition: Position;
};

export type TokenMoveOnBoardData = {
  roomId: RoomId;
  boardId: BoardId;
  tokenId: TokenId;
  newPosition: Position;
};

export type TokenMoveFromBoardData = {
  roomId: RoomId;
  boardId: BoardId;
  tokenId: TokenId;
};

/*
 * ===========================================
 * ボード・セル関連
 * ===========================================
 */

export type BoardUpdateData = {
  board: CellData[];
  boardTokens: TokenData[];
};

/*
 * ===========================================
 * ドラッグ可能オブジェクト
 * ===========================================
 */
export type DraggableMovedData = {
  roomId: RoomId;
  draggableId: DraggableId;
  coordinate: Coordinate;
  rotation: number;
};

export type DraggableUpdateData = {
  draggableId: DraggableId;
  coordinate: Coordinate;
  rotation: number;
  zIndex: number;
};

/*
 * ===========================================
 * ダイス
 * ===========================================
 */
export type DiceRollData = {
  roomId: RoomId;
  diceId: DiceId;
  sides: number;
};

export type DiceUpdateData = {
  value: number;
};

/*
 * ===========================================
 * オブジェクト重ね順
 * ===========================================
 */
export type ObjectBringToData = {
  roomId: RoomId;
  objectId: [DeckId, CardId] | DraggableId;
  type: 'card' | 'draggable';
  isFront: boolean;
};

/*
 * ===========================================
 * ゲーム進行・フェーズ管理
 * ===========================================
 */
export type PhaseUpdateData = {
  newPhase: Phase;
};

export type GameNextTrunData = {
  roomId: RoomId;
};

export type GameNextRoundData = {
  roomId: RoomId;
};

export type GameTurnUpdateData = {
  currentPlayerId: PlayerId;
  currentRoundIndex: number;
  currentTurnIndex: number;
};

/*
 * ===========================================
 * システム・ユーティリティ
 * ===========================================
 */
export type SystemMessageData = {
  message: string;
  isPersistent?: boolean;
};
