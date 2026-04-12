import { server_log } from '../log/logger.js';
export class DeckManager {
    /**
     * カードをデッキから引く
     */
    drawCard(state, deckId, condition, playerId) {
        const [targetLocation, targetState] = condition;
        // デッキから「deck」ロケーションにあるカードを抽出
        const currentDeck = state.decks[deckId].filter((c) => c.location === 'deck');
        if (!currentDeck.length)
            return false;
        const card = currentDeck[0];
        card.isFaceUp = targetState === 'face';
        let destination = '';
        // A. 捨て札へ
        if (targetLocation === 'discard') {
            card.location = 'discard';
            card.ownerId = null;
            state.discardPile[deckId].push(card);
            destination = 'discard';
        }
        // B. プレイヤーの手札へ
        else if (playerId && targetLocation === 'hand') {
            const player = state.players.find((p) => p.id === playerId);
            if (player) {
                card.location = 'hand';
                card.ownerId = playerId;
                player.cards.push(card);
                destination = playerId;
            }
        }
        // C. プレイフィールドへ
        else {
            card.location = 'field';
            card.ownerId = null;
            state.playFieldCards[deckId].push(card);
            destination = 'field';
        }
        server_log('deck', state.gameId, state.roomId, `DRAW: ${card.name} (ID:${card.id}) (deck -> ${destination}, state: ${targetState})`);
    }
}
