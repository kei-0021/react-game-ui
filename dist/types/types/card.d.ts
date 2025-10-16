import { CardLocation } from "./cardLocation.js";
import { CardId, DeckId, PlayerId } from "./definition.js";
export type Card = {
    id: CardId;
    deckId: DeckId;
    name: string;
    description?: string;
    onPlay?: (...args: any[]) => void;
    ownerId: PlayerId | null;
    location: CardLocation;
    drawLocation: CardLocation;
    playLocation: CardLocation;
    playBackLocation: CardLocation;
    isFaceUp?: boolean;
    frontImage?: string;
    backColor: string;
};
