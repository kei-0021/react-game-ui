// src/server/server-create-state.ts

import type {
  BoardId,
  CardData,
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
import { DeckData } from '@/types/deck.js';
import { TokenData } from '@/types/token.js';
import { TokenStoreData } from '@/types/tokenStore.js';
import { server_log } from '../log/logger.js';
import { generateColorFromId } from './utils.js';

/**
 * GameParamからRoomStateを作成する
 * @param roomId - ルームID
 * @param param - ゲーム開始時に必要な初期パラメータ
 * @returns 初期化が完了した {@link RoomState} オブジェクト
 */
export function createState(roomId: RoomId, param: GameParam): RoomState {
  if (param.maxPlayers) {
    server_log('game', param.gameId, roomId, `参加可能人数: ${param.maxPlayers}人`);
  }

  const initialDecks = param.initialDecks || [];
  const decks: Record<DeckId, CardData[]> = {};
  const playFieldCards: Record<DeckId, CardData[]> = {};
  const discardPile: Record<DeckId, CardData[]> = {};
  const holdCards: Record<PlayerId, Record<DeckId, CardId[]>> = {};

  const initialBoard = param.initialBoard || {};
  let Cells: Record<BoardId, CellData[]> = {};

  const initialTokenStores = param.initialTokenStores || [];
  const tokenStores: Record<TokenStoreId, TokenData[]> = {};

  // デッキ関連の初期化
  initialDecks.forEach((deck: DeckData) => {
    const cards: CardData[] = (deck.cards || []).map((c, index) => ({
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
  initialTokenStores.forEach((tokenStore: TokenStoreData) => {
    const tokens: TokenData[] = (tokenStore.tokens || []).map((t, index) => ({
      ...t,
      tokenStoreId: tokenStore.tokenStoreId,
      instanceId: `${roomId}_${tokenStore.tokenStoreId}_${index}`,
    }));
    tokenStores[tokenStore.tokenStoreId] = tokens;
    server_log('token', param.gameId, roomId, `トークン置き場 "${tokenStore.tokenStoreId}" を初期化完了`);
  });

  // ドラッグ可能オブジェクト関連の初期化
  let draggables: Record<DraggableId, DraggableData> = {};
  if (param.draggables) {
    draggables = structuredClone(param.draggables);

    server_log('draggable', param.gameId, roomId, `ドラッグ可能オブジェクトを初期化完了`);

    const firstEntry = Object.entries(draggables)[0];
    if (firstEntry) {
      const [key, value] = firstEntry;
      server_log(
        'draggable',
        param.gameId,
        roomId,
        `ドラッグ可能オブジェクトのサンプル:\n${key}: ${JSON.stringify(value, null, 2)}`,
        'DEBUG',
      );
    }
  }

  const initialMaxZIndex = Object.values(draggables).reduce((max, d) => Math.max(max, d.zIndex || 0), 0);
  const boardTokens: Record<BoardId, TokenData[]> = Object.fromEntries(Object.keys(Cells).map((id) => [id, []]));

  // 全ての initialTokensOnBoard を、ひとまず最初のボードに突っ込む
  const defaultBoardId = Object.keys(Cells)[0];

  Object.entries(param.initialTokensOnBoard || {}).forEach(([_, p]) => {
    const tokens = Array.isArray(p) ? p : [p];
    const npcTokens = tokens.filter((t) => t.ownerId !== ('player' as any));

    if (boardTokens[defaultBoardId]) {
      boardTokens[defaultBoardId].push(...npcTokens);
    }
  });

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
    boardTokens: boardTokens,
    exploredCells: [],
    tokenStores: tokenStores,
    draggables: draggables,
    timer: {} as NodeJS.Timeout,
    maxZIndex: initialMaxZIndex,
    systemMessageHistory: [],
  };

  server_log('room', state.gameId, roomId, `ルーム初期化完了`);
  console.log(JSON.stringify(boardTokens, null, 2));
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
    resources: param.initialResources || [],
    tokens: [],
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

  // 駒の配布処理
  if (param.initialTokensOnBoard) {
    const templates = Object.entries(param.initialTokensOnBoard).filter(([_, p]) =>
      p.some((t) => t.ownerId === ('player' as any)),
    );

    templates.forEach(([key, p]) => {
      const template = p.find((t) => t.ownerId === ('player' as any));
      if (!template) return;

      const tokenId = `${key}_${playerId}`;

      state.boardTokens[tokenId] = [
        {
          ...template,
          id: tokenId,
          ownerId: playerId,
          name: newPlayer.name,
          color: newPlayer.color,
          position: {
            row: template.position?.row ?? 0,
            col: (template.position?.col ?? 0) + state.players.length,
          },
          movableCells: [],
        },
      ];

      server_log('cell', state.gameId, state.roomId, `プレイヤー ${newPlayer.name} 用の駒を生成しました`);
    });
  }

  // 初期トークンの配布処理
  const initialTokens = param.initialTokens;
  if (initialTokens) {
    for (const [tokenId, count] of Object.entries(initialTokens)) {
      const masterTokenList = state.tokenStores[tokenId];

      if (masterTokenList) {
        for (let i = 0; i < count; i++) {
          // リストが空でないか確認し、先頭から要素を一つ取り出す
          if (masterTokenList.length > 0) {
            const token = masterTokenList.shift();
            if (token !== undefined) {
              newPlayer.tokens.push(token);
            }
          } else {
            // 在庫が切れた場合の処理が必要であればここに記述
            break;
          }
        }
      }
    }
  }

  return newPlayer;
}
