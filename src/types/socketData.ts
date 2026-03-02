// src/types/socketData.ts

import { Card } from './card.js';
import { CardLocation } from './cardLocation.js';
import { CardState } from './cardState.js';
import { Coordinate } from './coodinate.js';
import { CardId, DeckId, DraggableId, GameId, PlayerId, RoomId } from './definition.js';
import { Phase } from './phase.js';

export type RoomMeta = {
  id: RoomId;
  gameId: GameId;
  playerCount: number;
  maxPlayers?: number;
  createdAt: number;
};

export type RoomJoinData = {
  roomId: RoomId;
  gameId: GameId;
  playerName: PlayerId;
};

export type DeckDrawData = {
  roomId: RoomId;
  deckId: DeckId;
  playerId?: PlayerId | null;
  drawCondition: [CardLocation, CardState];
};

export type DeckUpdateData = {
  currentDeck: Card[];
  drawnCards: Card[];
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

export type CardMoveFromFieldData = {
  roomId: RoomId;
  deckId: DeckId;
  cardId: string;
  playerId?: PlayerId | null;
};

export type DraggableMovedData = {
  roomId: RoomId;
  draggableId: DraggableId;
  coordinate: Coordinate;
  rotation: number;
  zIndex: number;
};

export type DraggableUpdateData = {
  draggableId: DraggableId;
  coordinate: Coordinate;
  rotation: number;
  zIndex: number;
};

export type GamePhaseUpdateData = {
  newPhase: Phase;
};

export type GameNextTrunData = {
  roomId: RoomId;
};

export type GameTurnUpdateData = {
  currentPlayerId: PlayerId;
  currentRoundIndex: number;
  currentTurnIndex: number;
};
