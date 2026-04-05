import { CardData } from './card.js';
import { DeckId } from './definition.js';

export type DeckData = {
  deckId: DeckId;
  name: string;
  backColor: string;
  cards: CardData[];
};
