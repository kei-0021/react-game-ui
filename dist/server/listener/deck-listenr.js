import { RoomManager } from '../room-manager.js';
/**
 * デッキ・カード操作専用のイベントリスナーを登録する。
 * 山札からのドロー、フィールドへのプレイ、カードの反転（フリップ）など、
 * プレイヤー対戦の核となるアクションを制御する。
 */
export function registerDeckListeners(socket, io, gameParams, activeRooms) {
    // カードを引く
    socket.on('deck:draw', (data) => {
        const { roomId, deckId, playerId, drawCondition } = data;
        const state = activeRooms.get(roomId);
        if (!state || playerId === null)
            return;
        const param = gameParams[state.gameId];
        const roomManager = new RoomManager(io, param, state);
        if (playerId && state.holdCards[playerId]) {
            roomManager.server_log('card', `${playerId} はカードをホールドしているので、カードを引くことができません`);
            return;
        }
        const success = roomManager.drawCard(deckId, drawCondition, playerId);
        if (!success)
            return;
        // カスタムフック
        param?.onDeckDraw?.(state, roomManager, data);
    });
    // デッキシャッフル
    socket.on('deck:shuffle', ({ roomId, deckId }) => {
        const state = activeRooms.get(roomId);
        if (!state)
            return;
        const param = gameParams[state.gameId];
        const roomManager = new RoomManager(io, param, state);
        roomManager.shuffleDeck(deckId);
        roomManager.emitDeckUpdate(deckId);
    });
    socket.on('deck:reset', ({ roomId, deckId }) => {
        const state = activeRooms.get(roomId);
        if (!state)
            return;
        const param = gameParams[state.gameId];
        const roomManager = new RoomManager(io, param, state);
        roomManager.server_log('deck', `${deckId} を山札に戻した`);
        state.decks[deckId].forEach((c) => {
            if (c.location === 'discard') {
                c.location = 'deck';
                c.isFaceUp = false;
                c.ownerId = null;
            }
        });
        state.discardPile[deckId] = [];
        roomManager.shuffleDeck(deckId);
        roomManager.emitDeckUpdate(deckId);
    });
    // カードプレイ
    socket.on('card:play', (data) => {
        const state = activeRooms.get(data.roomId);
        if (!state)
            return;
        const param = gameParams[state.gameId];
        const roomManager = new RoomManager(io, param, state);
        roomManager.playCard(data);
    });
    // カードホールド
    socket.on('card:hold', ({ roomId, playerId, cardIdsbyDeck }) => {
        const state = activeRooms.get(roomId);
        if (!state)
            return;
        const param = gameParams[state.gameId];
        const roomManager = new RoomManager(io, param, state);
        const player = state.players.find((p) => p.id === playerId);
        if (player) {
            state.holdCards[player.id] = state.holdCards[player.id] || {};
            Object.entries(cardIdsbyDeck).forEach(([deckId, cardIds]) => {
                const ids = Array.isArray(cardIds) ? cardIds : [cardIds];
                state.holdCards[player.id][deckId] = ids;
                roomManager.server_log('card', `${playerId} がカード [${cardIds}] をホールドしました`);
            });
            player.isHolding = true;
        }
        roomManager.emitPlayerUpdate();
        // カスタムフック
        const onAllPlayersCardHold = param.onAllPlayersCardHold;
        if (onAllPlayersCardHold && state.players.every((p) => p.isHolding)) {
            onAllPlayersCardHold(state, roomManager);
        }
    });
    // カードをひっくり返す
    socket.on('card:flip', ({ roomId, playerId, cardIds }) => {
        const state = activeRooms.get(roomId);
        if (!state)
            return;
        const param = gameParams[state.gameId];
        const roomManager = new RoomManager(io, param, state);
        const p = state?.players.find((p) => p.id === playerId);
        if (p) {
            const ids = Array.isArray(cardIds) ? cardIds : [cardIds];
            p.cards.forEach((c) => {
                if (ids.includes(c.id)) {
                    c.isFaceUp = !c.isFaceUp;
                    roomManager.server_log('card', `${playerId} がカード ${c.id} をひっくり返しました`);
                }
            });
            roomManager.emitPlayerUpdate();
        }
        Object.entries(state.playFieldCards).forEach(([deckId, cards]) => {
            cards.forEach((c) => {
                if (cardIds.includes(c.id)) {
                    c.isFaceUp = !c.isFaceUp;
                    roomManager.server_log('card', `${playerId} がカード ${c.id} をひっくり返しました`);
                }
            });
            roomManager.emitDeckUpdate(deckId);
        });
    });
    // カード位置同期
    socket.on('card:move-on-field', ({ roomId, deckId, cardId, coordinate, zIndex }) => {
        const state = activeRooms.get(roomId);
        if (!state)
            return;
        const param = gameParams[state.gameId];
        const roomManager = new RoomManager(io, param, state);
        const card = state?.decks[deckId]?.find((c) => c.id === cardId);
        if (card) {
            card.coordinate = coordinate;
            if (zIndex) {
                card.zIndex = zIndex;
            }
            roomManager.emitDeckUpdate(deckId);
        }
    });
    // フィールドから「手札」または「捨て札」へ移動
    socket.on('card:move-from-field', (data) => {
        const { roomId, deckId, cardId, playerId } = data;
        const state = activeRooms.get(roomId);
        if (!state || !playerId)
            return;
        const param = gameParams[state.gameId];
        const roomManager = new RoomManager(io, param, state);
        if (state.holdCards[playerId]) {
            roomManager.server_log('card', `${playerId} はカードをホールドしているので、カードを移動できません`);
            return;
        }
        const success = roomManager.moveFromField(deckId, cardId, playerId);
        if (!success)
            return;
    });
}
