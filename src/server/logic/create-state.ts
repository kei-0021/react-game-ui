// src/server/server-create-state.ts

import type {
  BoardId,
  Card,
  CardId,
  CellData,
  DeckId,
  DraggableData,
  DraggableId,
  GameParam,
  Player,
  PlayerId,
  RoomId,
  RoomState,
  TokenStoreId,
} from '@/index.js';
import { Deck } from '@/types/deck.js';
import { Token } from '@/types/token.js';
import { TokenStore } from '@/types/tokenStore.js';
import { generateColorFromId, RoomManager } from '../server-utils.js';

/**
 * GameParamからRoomStateを作成する
 * @param roomId - ルームID
 * @param param - ゲーム開始時に必要な初期パラメータ
 * @returns 初期化が完了した {@link RoomState} オブジェクト
 */
export function createState(roomId: RoomId, param: GameParam): RoomState {
  const initialDecks = param.initialDecks || [];
  const initialTokenStores = param.initialTokenStores || [];
  const initialBoard = param.initialBoard || {};

  let Cells: Record<BoardId, CellData[]> = {};
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

  const decks: Record<DeckId, Card[]> = {};
  const playFieldCards: Record<DeckId, Card[]> = {};
  const discardPile: Record<DeckId, Card[]> = {};
  const holdCards: Record<PlayerId, Record<DeckId, CardId[]>> = {};

  const tokenStores: Record<TokenStoreId, Token[]> = {};

  initialDecks.forEach((deck: Deck) => {
    const cards: Card[] = (deck.cards || []).map((c, index) => ({
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

  initialTokenStores.forEach((tokenStore: TokenStore) => {
    const tokens: Token[] = (tokenStore.tokens || []).map((t, index) => ({
      ...t,
      tokenStoreId: tokenStore.tokenStoreId,
      instanceId: `${roomId}_${tokenStore.tokenStoreId}_${index}`,
    }));
    tokenStores[tokenStore.tokenStoreId] = tokens;
    RoomManager.server_log('token', param.gameId, roomId, `トークン置き場 "${tokenStore.tokenStoreId}" を初期化完了`);
  });

  let draggables: Record<DraggableId, DraggableData> = {};
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

  const state: RoomState = {
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
    timer: {} as NodeJS.Timeout,
    maxZIndex: initialMaxZIndex,
    systemMessageHistory: [],
  };

  RoomManager.server_log('room', state.gameId, roomId, `ルーム初期化完了`);
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
export function createPlayer(param: GameParam, state: RoomState, playerName: string, socketId: string): Player {
  // プレイヤークラスの初期化
  const playerId = `${state.roomId}_p${state.players.length + 1}`;
  const newPlayer: Player = {
    id: playerId,
    name: playerName?.trim() || `Player ${state.players.length + 1}`,
    color: generateColorFromId(playerId),
    socketId: socketId,
    cards: [],
    isHolding: false,
    score: 0,
    resources: JSON.parse(JSON.stringify(param.initialResources || [])),
    tokens: [],
    position: { row: 0, col: 0 },
    movableCells: [],
    pieceImage: param.pieceImage,
  };

  // 初期手札配布処理
  const initialHand = param.initialHand;
  if (initialHand) {
    for (const [deckId, count] of Object.entries(initialHand)) {
      const target = state.decks[deckId];

      if (!target) continue;

      for (let i = 0; i < count; i++) {
        const idx = target.findIndex((c) => c.location === 'deck');
        if (idx === -1) break;

        const card = target[idx];
        card.location = 'hand';
        card.ownerId = newPlayer.id;

        card.isFaceUp = card.drawCondition[1] === 'face';

        newPlayer.cards.push(card);
      }
    }
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
