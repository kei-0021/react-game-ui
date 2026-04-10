import type { CardData } from './card.js';
import type { DeckId } from './definition.js';

export type DeckData = {
  deckId: DeckId;
  name: string;
  backColor: string;
  cards: CardData[];
};
