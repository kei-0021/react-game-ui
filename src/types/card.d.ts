// ID のタイプエイリアス
export type CardId = string;
export type DeckId = string;

export type Card = {
  deckId: DeckId
  id: CardId;
  name: string;
  description?: string;
  onPlay?: () => void; // ここが追加
  location: "deck" | "field" | { hand: string };
};