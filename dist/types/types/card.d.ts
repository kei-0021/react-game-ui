export type CardId = string;
export type DeckId = string;
export type Card = {
    id: CardId;
    deckId: DeckId;
    name: string;
    description?: string;
    onPlay?: () => void;
    location: "deck" | "field" | {
        hand: string;
    };
};
