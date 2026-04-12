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
    /**
     * デッキをシャッフルする
     */
    shuffleDeck = (state, deckId) => {
        const targetDeck = state.decks[deckId];
        if (!targetDeck)
            return;
        const currentDeck = targetDeck.filter((c) => c.location === 'deck');
        const otherCards = targetDeck.filter((c) => c.location !== 'deck');
        for (let i = currentDeck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [currentDeck[i], currentDeck[j]] = [currentDeck[j], currentDeck[i]];
        }
        state.decks[deckId] = currentDeck.concat(otherCards);
        server_log('deck', state.gameId, state.roomId, `${deckId} をシャッフル`);
    };
}
