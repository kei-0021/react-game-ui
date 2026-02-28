// src/types/socketData.ts

import { Card } from './card.js';
import { CardLocation } from './cardLocation.js';
import { CardState } from './cardState.js';
import { Coordinate } from './coodinate.js';
import { CardId, DeckId, DraggableId, PlayerId, RoomId } from './definition.js';

export type DeckUpdateData = {
  currentDeck: Card[];
  drawnCards: Card[];
  playFieldCards: Card[];
  discardPile: Card[];
};

export type DeckDrawData = {
  roomId: RoomId;
  deckId: DeckId;
  playerId?: PlayerId | null;
  drawCondition: [CardLocation, CardState];
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
};

export type DraggableUpdateData = {
  draggableId: DraggableId;
  coordinate: Coordinate;
};
