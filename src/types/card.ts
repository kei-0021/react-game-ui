import { CardLocation } from "./cardLocation.js";

// ID のタイプエイリアス
export type CardId = string;
export type DeckId = string;

export type Card = {
  id: CardId;
  deckId: DeckId
  name: string;
  description?: string;
  onPlay?: (...args: any[]) => void;
  location: CardLocation;
  drawLocation: CardLocation;
  playLocation: CardLocation;
  isFaceUp?: boolean;
};