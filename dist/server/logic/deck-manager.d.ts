import { CardLocation } from '@/types/cardLocation.js';
import { CardState } from '@/types/cardState.js';
import { CardId, DeckId, PlayerId } from '@/types/definition.js';
import { GameParam } from '@/types/gameParam.js';
import { RoomState } from '@/types/roomState.js';
import { CardPlayData } from '@/types/socketData.js';
import type { RoomManager } from '../room-manager.js';
export declare class DeckManager {
    private param;
    private state;
    constructor(param: GameParam, state: RoomState);
    /**
     * カードをデッキから引く
     */
    drawCard(deckId: DeckId, condition: [CardLocation, CardState], playerId?: PlayerId): false | undefined;
    /**
     * デッキをシャッフルする
     */
    shuffleDeck: (deckId: DeckId) => void;
    /**
     * カードをプレイする
     */
    playCard(data: CardPlayData, roomManager: RoomManager): void;
    /**
     * ホールド状態を解除し、カードを出す
     */
    unholdCards(roomManager: RoomManager): void;
    /**
     * フィールドからカードを回収（手札に戻す or 捨て札へ）
     */
    moveFromField(deckId: DeckId, cardId: CardId, playerId?: PlayerId | null): void;
}
//# sourceMappingURL=deck-manager.d.ts.map