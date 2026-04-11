// src/server/server-create-state.ts
import { server_log } from '../log/logger.js';
import { generateColorFromId } from './utils.js';
/**
 * GameParamからRoomStateを作成する
 * @param roomId - ルームID
 * @param param - ゲーム開始時に必要な初期パラメータ
 * @returns 初期化が完了した {@link RoomState} オブジェクト
 */
export function createState(roomId, param) {
    if (param.maxPlayers) {
        server_log('game', param.gameId, roomId, `参加可能人数: ${param.maxPlayers}人`);
    }
    const initialDecks = param.initialDecks || [];
    const decks = {};
    const playFieldCards = {};
    const discardPile = {};
    const holdCards = {};
    const initialBoard = param.initialBoard || {};
    let Cells = {};
    const initialTokenStores = param.initialTokenStores || [];
    const tokenStores = {};
    // デッキ関連の初期化
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
        server_log('deck', param.gameId, roomId, `デッキ "${deck.deckId}" を初期化完了`);
        const firstEntry = cards[0];
        if (firstEntry) {
            server_log('deck', param.gameId, roomId, `デッキのサンプル:\n ${JSON.stringify(firstEntry, null, 2)}`, 'DEBUG');
        }
    });
    // ボード関連の初期化
    const boardEntries = Object.entries(initialBoard);
    boardEntries.forEach(([boardId, boardData]) => {
        Cells[boardId] = boardData;
        // カスタムの再配置・接続関数があるか確認
        const shuffleAndReconnector = param.shuffleAndReconnectBoard?.[boardId];
        if (typeof shuffleAndReconnector === 'function') {
            server_log('cell', param.gameId, roomId, `ボード "${boardId}" をカスタム戦略で再配置・接続します`);
            Cells[boardId] = shuffleAndReconnector(boardData);
        }
        server_log('cell', param.gameId, roomId, `ボード "${boardId}" を初期化完了`);
    });
    // トークン関連の初期化
    initialTokenStores.forEach((tokenStore) => {
        const tokens = (tokenStore.tokens || []).map((t, index) => ({
            ...t,
            tokenStoreId: tokenStore.tokenStoreId,
            instanceId: `${roomId}_${tokenStore.tokenStoreId}_${index}`,
        }));
        tokenStores[tokenStore.tokenStoreId] = tokens;
        server_log('token', param.gameId, roomId, `トークン置き場 "${tokenStore.tokenStoreId}" を初期化完了`);
    });
    // ドラッグ可能オブジェクト関連の初期化
    let draggables = {};
    if (param.draggables) {
        draggables = structuredClone(param.draggables);
        server_log('draggable', param.gameId, roomId, `ドラッグ可能オブジェクトを初期化完了`);
        const firstEntry = Object.entries(draggables)[0];
        if (firstEntry) {
            const [key, value] = firstEntry;
            server_log('draggable', param.gameId, roomId, `ドラッグ可能オブジェクトのサンプル:\n${key}: ${JSON.stringify(value, null, 2)}`, 'DEBUG');
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
        pieces: param.initialPieces || {},
        exploredCells: [],
        tokenStores: tokenStores,
        draggables: draggables,
        timer: {},
        maxZIndex: initialMaxZIndex,
        systemMessageHistory: [],
    };
    server_log('room', state.gameId, roomId, `ルーム初期化完了`);
    return state;
}
/**
 * GameParamからRoomStateを作成する
 * @param param - ゲーム開始時に必要な初期パラメータ
 * @param state - 初期化済みのルームの状態
 * @param playerName - 新しくルームに参加するプレイヤー名
 * @param socketId - 新しくルームに参加するプレイヤーのソケットID
 * @returns 初期化完了済みのプレイヤーオブジェクト
 */
export function createPlayer(param, state, playerName, socketId) {
    // プレイヤークラスの初期化
    const playerId = `${state.roomId}_p${state.players.length + 1}`;
    const newPlayer = {
        id: playerId,
        name: playerName?.trim() || `Player ${state.players.length + 1}`,
        color: generateColorFromId(playerId),
        socketId: socketId,
        cards: [],
        isHolding: false,
        score: 0,
        resources: param.initialResources || [],
        tokens: [],
    };
    // 初期手札配布処理
    const initialHand = param.initialHand;
    if (initialHand) {
        for (const [deckId, count] of Object.entries(initialHand)) {
            const target = state.decks[deckId];
            if (!target)
                continue;
            for (let i = 0; i < count; i++) {
                const idx = target.findIndex((c) => c.location === 'deck');
                if (idx === -1)
                    break;
                const card = target[idx];
                card.location = 'hand';
                card.ownerId = newPlayer.id;
                card.isFaceUp = card.drawCondition[1] === 'face';
                newPlayer.cards.push(card);
            }
        }
    }
    // 駒の配布処理
    if (param.initialPieces) {
        const templates = Object.entries(param.initialPieces).filter(([_, p]) => p.ownerId === 'player');
        templates.forEach(([templateId, template]) => {
            const pieceId = `${templateId}_${playerId}`;
            state.pieces[pieceId] = {
                ...template,
                id: pieceId,
                ownerId: playerId,
                name: newPlayer.name,
                color: newPlayer.color,
                position: {
                    row: template.position?.row ?? 0,
                    col: (template.position?.col ?? 0) + state.players.length,
                },
                movableCells: [],
            };
            server_log('cell', state.gameId, state.roomId, `プレイヤー ${newPlayer.name} 用の駒を生成しました`);
        });
    }
    // 初期トークンの配布処理
    const initialTokens = param.initialTokens;
    if (initialTokens) {
        for (const [tokenId, count] of Object.entries(initialTokens)) {
            const masterTokenList = state.tokenStores[tokenId];
            if (masterTokenList && masterTokenList.length > 0) {
                // 配列の最初の要素（Tokenオブジェクト）を取り出す
                const masterToken = masterTokenList[0];
                for (let i = 0; i < count; i++) {
                    // オブジェクトをコピーして push
                    newPlayer.tokens.push(masterToken);
                }
            }
        }
    }
    return newPlayer;
}
