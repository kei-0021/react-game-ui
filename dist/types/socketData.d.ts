import { Card } from './card.js';
import { CardLocation } from './cardLocation.js';
import { CardState } from './cardState.js';
import { DeckId, PlayerId, RoomId } from './definition.js';
export type DeckUpdateData = {
    currentDeck: Card[];
    drawnCards: Card[];
    discardPile: Card[];
};
export type DeckDrawData = {
    roomId: RoomId;
    deckId: DeckId;
    playerId?: PlayerId | null;
    drawCondition: [CardLocation, CardState];
};
export type CardMoveFromFieldData = {
    roomId: RoomId;
    deckId: DeckId;
    cardId: string;
    targetPlayerId?: PlayerId;
};
//# sourceMappingURL=socketData.d.ts.map