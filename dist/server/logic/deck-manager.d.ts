import { CardLocation } from '@/types/cardLocation.js';
import { CardState } from '@/types/cardState.js';
import { DeckId, PlayerId } from '@/types/definition.js';
import { RoomState } from '@/types/roomState.js';
export declare class DeckManager {
    /**
     * カードをデッキから引く
     */
    drawCard(state: RoomState, deckId: DeckId, condition: [CardLocation, CardState], playerId?: PlayerId): false | undefined;
}
//# sourceMappingURL=deck-manager.d.ts.map