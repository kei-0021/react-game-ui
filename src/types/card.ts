// ID のタイプエイリアス
export type CardId = string;
export type DeckId = string;

export type Card = {
  id: CardId;
  deckId: DeckId
  name: string;
  description?: string;
  onPlay?: (...args: any[]) => void;
  location: "deck" | "field" | { hand: string };
};