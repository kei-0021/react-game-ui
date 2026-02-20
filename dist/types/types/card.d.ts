import { Coordinate } from '@/server/server-utils.js';
import { CardLocation } from './cardLocation.js';
import { CardId, DeckId, PlayerId } from './definition.js';
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
    fieldBackLocation: CardLocation;
    isFaceUp?: boolean;
    frontImage?: string;
    backColor: string;
    coordinate?: Coordinate;
};
//# sourceMappingURL=card.d.ts.map