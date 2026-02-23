// src/types/socketData.ts

import { CardLocation } from './cardLocation.js';
import { CardState } from './cardState.js';
import { DeckId, PlayerId, RoomId } from './definition.js';

export type DeckDrawSocketData = {
  roomId: RoomId;
  deckId: DeckId;
  playerId?: PlayerId | null;
  drawCondition: [CardLocation, CardState];
};
