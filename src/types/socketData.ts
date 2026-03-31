// src/types/socketData.ts

import { CellData, DraggableData } from '@/index.js';
import { ComponentInfo, RoomState } from '@/types/server.js';
import { Card } from './card.js';
import { CardLocation } from './cardLocation.js';
import { CardState } from './cardState.js';
import { Coordinate } from './coodinate.js';
import { Deck } from './deck.js';
import {
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
import { Phase } from './phase.js';
import { Token } from './token.js';
import { TokenStore } from './tokenStore.js';

/*
 * ===========================================
 * ゲーム・ルーム情報
 * ===========================================
 */
export type GameMeta = {
  gameId: GameId;
  gameIcon: string;
  maxPlayers?: number;
  initialHand?: Record<DeckId, number>;
  initialDecks?: Deck[];
  initialTokenStores?: TokenStore[];
  initialTokens?: Record<TokenStoreId, number>;
  draggables?: Record<DraggableId, DraggableData>;
  components?: ComponentInfo[];
};

export type RoomMeta = {
  id: RoomId;
  gameId: GameId;
  playerCount: number;
  maxPlayers?: number;
  createdAt: number;
};

export type LobbyGameList = {
  games: GameMeta[];
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
  newParam: Partial<GameMeta>;
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
  currentDeck: Card[];
  playFieldCards: Card[];
  discardPile: Card[];
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
};

export type CardMoveFromFieldData = {
  roomId: RoomId;
  deckId: DeckId;
  cardId: string;
  playerId?: PlayerId | null;
};

/*
 * ===========================================
 * トークン・リソース操作関連
 * ===========================================
 */
export type TokenAcquireData = {
  roomId: RoomId;
  tokenStoreId: TokenStoreId;
  tokenId: TokenId;
};

export type TokenStoreUpdateData = {
  tokenStore: Token[];
};

/*
 * ===========================================
 * ボード・セル関連
 * ===========================================
 */

export type BoardMovableRangeData = {
  roomId: RoomId;
  boardId: BoardId;
  playerId: PlayerId;
  moveRange: number;
  isExact: boolean;
};

export type BaordMovePlayerData = {
  roomId: RoomId;
  boardId: BoardId;
  playerId: PlayerId;
  newLocation: any;
};

export type BoardUpdateData = {
  boardId: BoardId;
  board: CellData[];
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
export type GamePhaseUpdateData = {
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
