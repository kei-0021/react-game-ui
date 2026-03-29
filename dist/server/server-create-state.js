// src/server/server-create-state.ts
import { RoomManager } from './server-utils.js';
/**
 * GameParamからRoomStateを作成する
 * @param roomId - ルームID
 * @param param - ゲーム開始時に必要な初期パラメータ
 * @returns 初期化が完了した {@link RoomState} オブジェクト
 */
export function createState(roomId, param) {
    const initialDecks = param.initialDecks || [];
    const initialTokenStores = param.initialTokenStores || [];
    const initialBoard = param.initialBoard || {};
    let Cells = {};
    const boardEntries = Object.entries(initialBoard);
    if (param.maxPlayers) {
        RoomManager.server_log('game', param.gameId, roomId, `参加可能人数: ${param.maxPlayers}人`);
    }
    boardEntries.forEach(([boardId, boardData]) => {
        Cells[boardId] = boardData;
        // カスタムの再配置・接続関数があるか確認
        const shuffleAndReconnector = param.shuffleAndReconnectBoard?.[boardId];
        if (typeof shuffleAndReconnector === 'function') {
            RoomManager.server_log('cell', param.gameId, roomId, `ボード "${boardId}" をカスタム戦略で再配置・接続します`);
            Cells[boardId] = shuffleAndReconnector(boardData);
        }
        RoomManager.server_log('cell', param.gameId, roomId, `ボード "${boardId}" を初期化完了`);
    });
    const decks = {};
    const playFieldCards = {};
    const discardPile = {};
    const holdCards = {};
    const tokenStores = {};
    initialDecks.forEach((deck) => {
        const cards = (deck.cards || []).map((c, index) => ({
            ...c,
            deckId: deck.deckId,
            backColor: deck.backColor,
            instanceId: `${roomId}_${deck.deckId}_${index}`,
            location: 'deck',
            ownerId: null,
            coordinate: { x: 50, y: 50 },
        }));
        decks[deck.deckId] = cards;
        playFieldCards[deck.deckId] = [];
        discardPile[deck.deckId] = [];
        RoomManager.server_log('deck', param.gameId, roomId, `デッキ "${deck.deckId}" を初期化完了`);
        const firstEntry = cards[0];
        if (firstEntry) {
            RoomManager.server_log('deck', param.gameId, roomId, `サンプル:\n ${JSON.stringify(firstEntry, null, 2)}`);
        }
    });
    initialTokenStores.forEach((tokenStore) => {
        const tokens = (tokenStore.tokens || []).map((t, index) => ({
            ...t,
            tokenStoreId: tokenStore.tokenStoreId,
            instanceId: `${roomId}_${tokenStore.tokenStoreId}_${index}`,
        }));
        tokenStores[tokenStore.tokenStoreId] = tokens;
        RoomManager.server_log('token', param.gameId, roomId, `トークン置き場 "${tokenStore.tokenStoreId}" を初期化完了`);
    });
    let draggables = {};
    if (param.draggables) {
        draggables = structuredClone(param.draggables);
        RoomManager.server_log('draggable', param.gameId, roomId, `ドラッグ可能オブジェクトを初期化完了`);
        const firstEntry = Object.entries(draggables)[0];
        if (firstEntry) {
            const [key, value] = firstEntry;
            RoomManager.server_log('draggable', param.gameId, roomId, `サンプル:\n${key}: ${JSON.stringify(value, null, 2)}`);
        }
    }
    const initialMaxZIndex = Object.values(draggables).reduce((max, d) => Math.max(max, d.zIndex || 0), 0);
    const state = {
        roomId: roomId,
        gameId: param.gameId || '不明なゲーム',
        createdAt: Date.now(),
        currentTurnIndex: 0,
        currentRoundIndex: -1,
        currentPhase: param.initialPhase,
        players: [],
        decks: decks,
        playFieldCards: playFieldCards,
        discardPile: discardPile,
        holdCards: holdCards,
        boards: Cells,
        exploredCells: [],
        tokenStores: tokenStores,
        draggables: draggables,
        timer: {},
        maxZIndex: initialMaxZIndex,
        systemMessageHistory: [],
    };
    RoomManager.server_log('room', state.gameId, roomId, `ルーム初期化完了`);
    return state;
}
