// src/types/card.ts

import { CardLocation } from './cardLocation.js';
import { CardState } from './cardState.js';
import { CardId, DeckId, PlayerId } from './definition.js';
import { Coordinate } from './server.js';

export type Card = {
  id: CardId;
  deckId: DeckId;
  name: string;
  description?: string;
  onPlay?: (...args: any[]) => void;
  ownerId: PlayerId | null;
  location: CardLocation;
  drawCondition: [CardLocation, CardState];
  playLocation: CardLocation;
  fieldBackLocation: CardLocation;
  isFaceUp?: boolean;
  frontImage?: string;
  backColor: string;
  coordinate?: Coordinate;
};
