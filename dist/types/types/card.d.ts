import { CardLocation } from "./cardLocation.js";
export type CardId = string;
export type DeckId = string;
export type Card = {
    id: CardId;
    deckId: DeckId;
    name: string;
    description?: string;
    onPlay?: (...args: any[]) => void;
    backColor: string;
    location: CardLocation;
    drawLocation: CardLocation;
    playLocation: CardLocation;
    isFaceUp?: boolean;
};
