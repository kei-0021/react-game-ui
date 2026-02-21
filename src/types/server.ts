// -----------------------------------------------------------------
// 型定義 (TypeScript Interface)
// -----------------------------------------------------------------

import { RoomManager } from '@/server/server-utils.js';
import { Card } from './card.js';
import { Deck } from './deck.js';
import { DeckId, GameId, PlayerId, ResourceId, RoomId, TokenId } from './definition.js';
import { Resource } from './resource.js';
import { Token } from './token.js';

export interface ServerPlayer {
  id: PlayerId;
  name: string;
  socketId: string;
  color: string;
  cards: Card[];
  score: number;
  resources: Resource[];
  tokens: Token[];
  position: Position;
}

export type Position = { col: number; row: number };
export type Coordinate = { x: number; y: number };

export type RoomParam = {
  gameId: GameId;
  initialDecks: Deck[];
  initialHand?: {
    deckId: DeckId;
    count: number;
  };
  initialResources?: {
    resouceId: ResourceId;
    count: number;
  };
  initialTokenStores: any;
  initialTokens?: {
    tokenId: TokenId;
    count: number;
  };
  initialBoard: any;
  checkGameEnd: any;
  onGameEnd: any;
};

export type initialRoomState = {
  players: ServerPlayer[];
  initialResources: any[];
  initialTokenStores: any[];
  initialTokens: any[];
  board: any[][];
  exploredCells: Position[];
  turn: number;
};

export interface RoomState {
  roomId: RoomId;
  gameId: GameId;
  createdAt: number;
  currentRoundIndex: number;
  currentTurnIndex: number;
  decks: Record<DeckId, Card[]>;
  drawnCards: Record<string, Card[]>;
  playFieldCards: Record<string, Card[]>;
  discardPile: Record<string, Card[]>;
  initRoomState: RoomManager;
  checkGameEnd: any;
  onGameEnd: any;
}
