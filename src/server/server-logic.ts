// src/server/server.ts
import { Server, Socket } from 'socket.io';
import {
  createRandomBoard,
  generateColorFromId,
  LOG_CATEGORIES,
  markCellAsExplored,
  RoomManager,
  server_log,
  unmarkCellAsExplored,
} from './server-utils.js';

import { CardId, DeckId, PlayerId, RoomId } from '@/types/definition.js';
import { GameParam, RoomState } from '@/types/server.js';
import {
  CardHoldData,
  CardMoveFromFieldData,
  CardPlayData,
  DeckDrawData,
  DraggableMovedData,
  GameNextRoundData,
  GameNextTrunData,
  GameTurnUpdateData,
  RoomJoinData,
  RoomMeta,
  TokenAcquireData,
} from '@/types/socketData.js';
import { Token } from '@/types/token.js';
import { TokenStore } from '@/types/tokenStore.js';
import type { Card } from '../types/card.js';
import type { Deck } from '../types/deck.js';
import type { GameServerOptions } from './server.js';

const activeRooms = new Map<string, RoomState>();
const roomTimers = new Map<string, NodeJS.Timeout>();

/**
 * 新しいゲームルームの状態を初期化し、実行中のルーム管理（activeRooms）に追加する。
 *
 * 1. 設定（settings）に基づいたボードのランダム生成
 * 2. 各デッキ内のカードに対して固有の `instanceId` を付与し、初期位置を設定
 * 3. 最終的な `RoomState` オブジェクトの構築とメモリへの保存
 * @param roomId - ルームID
 * @param param - ゲーム開始時に必要な初期パラメータ
 * @returns 初期化が完了した {@link RoomState} オブジェクト
 */
function initializeRoom(roomId: RoomId, param: GameParam): RoomState {
  const initialDecks = param.initialDecks || [];
  const initialTokenStores = param.initialTokenStores || [];
  const initialBoard = param.initialBoard || {};

  let Cells: Record<string, any> = {};
  const boardEntries = Object.entries(initialBoard);

  boardEntries.forEach(([boardId, boardData]) => {
    Cells[boardId] = createRandomBoard(boardData as any[][]);
    server_log('cell', param.gameId, roomId, `ボード "${boardId}" を初期化完了`);
  });

  const decks: Record<DeckId, Card[]> = {};
  const playFieldCards: Record<DeckId, Card[]> = {};
  const discardPile: Record<DeckId, Card[]> = {};
  const holdCards: Record<PlayerId, Record<DeckId, CardId[]>> = {};

  const tokenStores: Record<string, Token[]> = {};

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
    server_log('deck', param.gameId, roomId, `デッキ "${deck.deckId}" を初期化完了`);
  });

  initialTokenStores.forEach((tokenStore: TokenStore) => {
    const tokens: Token[] = (tokenStore.tokens || []).map((t, index) => ({
      ...t,
      tokenStoreId: tokenStore.tokenStoreId,
      instanceId: `${roomId}_${tokenStore.tokenStoreId}_${index}`,
    }));
    tokenStores[tokenStore.tokenStoreId] = tokens;
    server_log('token', param.gameId, roomId, `トークン置き場 "${tokenStore.tokenStoreId}" を初期化完了`);
  });

  const state: RoomState = {
    roomId: roomId,
    gameId: param.gameId || '不明なゲーム',
    createdAt: Date.now(),
    maxPlayers: param.maxPlayers,
    currentTurnIndex: 0,
    currentRoundIndex: -1,
    currentPhase: param.initialPhase,
    players: [],
    decks: decks,
    playFieldCards: playFieldCards,
    discardPile: discardPile,
    holdCards: holdCards,
    board: Cells,
    exploredCells: [],
    tokenStores: tokenStores,
    systemMessageHistory: [],
  };

  activeRooms.set(roomId, state);
  server_log('room', state.gameId, roomId, `ルーム初期化完了`);
  return state;
}

export function initGameServer(io: Server, options: GameServerOptions) {
  const gameParams = options.gameParams || {};

  if (options.initialLogCategories) {
    Object.assign(LOG_CATEGORIES, options.initialLogCategories);
    console.log('[log] ログカテゴリをオプションで初期化しました。', LOG_CATEGORIES);
  }

  // --- プリセットごとの中身をスキャンしてログに出す ---
  Object.entries(gameParams).forEach(([gameId, preset]) => {
    if (preset.cardEffects) {
      const keys = Object.keys(preset.cardEffects);
      console.log(`[log][${gameId}] cardEffects (${keys.length}件): [ ${keys.join(', ')} ]`);
    }
    if (preset.cellEffects) {
      const keys = Object.keys(preset.cellEffects);
      console.log(`[log][${gameId}] cellEffects (${keys.length}件): [ ${keys.join(', ')} ]`);
    }
  });

  // --- ヘルパー関数 ---
  const stopTimer = (roomId: RoomId, gameId: string) => {
    const timer = roomTimers.get(roomId);
    if (timer) {
      clearTimeout(timer);
      roomTimers.delete(roomId);
      server_log('timer', gameId, roomId, `タイマー停止`);
    }
  };

  const shuffleDeck = (roomId: RoomId, deckId: DeckId) => {
    const state = activeRooms.get(roomId);
    if (!state || !state.decks[deckId]) return;

    server_log('deck', state.gameId, roomId, `${deckId} をシャッフル`);
    const currentDeck = state.decks[deckId].filter((c) => c.location === 'deck');
    const otherCards = state.decks[deckId].filter((c) => c.location !== 'deck');
    for (let i = currentDeck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [currentDeck[i], currentDeck[j]] = [currentDeck[j], currentDeck[i]];
    }
    state.decks[deckId] = currentDeck.concat(otherCards);
  };

  io.on('connection', (socket: Socket) => {
    // ロビー
    socket.on('lobby:get-rooms', () => {
      const roomList: RoomMeta[] = [];

      for (const [id, state] of activeRooms) {
        roomList.push({
          id,
          gameId: state.gameId,
          playerCount: state.players.length,
          maxPlayers: state.maxPlayers,
          createdAt: state.createdAt,
        });
      }

      socket.emit('lobby:rooms-list', roomList);
    });

    // ルーム参加
    socket.on('room:join', async ({ roomId, playerName, gameId }: RoomJoinData) => {
      if (!roomId) return;
      let state = activeRooms.get(roomId);
      const param = gameParams[gameId] || options;

      // 初回は状態の初期化を行う
      if (!state) {
        state = initializeRoom(roomId, { ...param, gameId: gameId });
        Object.keys(state.decks).forEach((id) => shuffleDeck(roomId, id));
        io.emit('lobby:room-update');
      }

      await socket.join(roomId);
      let player = state.players.find((p) => p.socketId === socket.id);

      // プレイヤークラスの初期化
      if (!player) {
        player = {
          id: `${roomId}_p${state.players.length + 1}`,
          name: playerName?.trim() || `Player ${state.players.length + 1}`,
          color: generateColorFromId(`${roomId}_p${state.players.length + 1}`),
          socketId: socket.id,
          cards: [],
          isHolding: false,
          score: 0,
          resources: JSON.parse(JSON.stringify(param.initialResources || [])),
          tokens: JSON.parse(JSON.stringify(param.initialTokens || [])),
          position: { row: 0, col: 0 },
        };
        state.players.push(player);
        server_log('game', param.gameId, roomId, `${player.name} (${player.id})が参加しました`);

        // 初期手札配布処理
        const hand = param.initialHand;
        if (hand && state.decks[hand.deckId]) {
          const target = state.decks[hand.deckId];
          for (let i = 0; i < hand.count; i++) {
            const idx = target.findIndex((c) => c.location === 'deck');
            if (idx === -1) break;

            const card = target[idx];
            card.location = 'hand';
            card.ownerId = player.id;
            card.isFaceUp = card.drawCondition[1] === 'face' ? true : false;

            player.cards.push(card);
          }
        }
      } else {
        player.socketId = socket.id;
      }
      // 各種コンポーネントの準備
      socket.emit('player:assign-id', player.id);

      // ここで準備完了を促す
      socket.emit('client:ready-to-sync', player.id);
    });

    // 準備完了を受けた同期処理
    socket.on('client:ready', (roomId) => {
      const state = activeRooms.get(roomId);
      if (!state) return;
      const param = gameParams[state.gameId];
      const roomManager = new RoomManager(io, param, state);

      // 全ての初期同期をここで実行
      const lastMessage = state.systemMessageHistory.at(-1);
      if (lastMessage) roomManager.emitSystemMessage(lastMessage, 0, true);

      // プレイヤー, デッキ, トークン置き場, ボード の初期状態を配信
      roomManager.emitPlayerUpdate();
      Object.keys(state.decks).forEach((id) => roomManager.emitDeckUpdate(id));
      Object.keys(state.tokenStores).forEach((id) => roomManager.emitTokenStoreUpdate(id));
      if (state.exploredCells.length > 0) socket.emit('board-update', state.exploredCells);
      Object.values(state.board).forEach((board) => socket.emit('game:init-board', board));

      // 初回の一人のみターンを更新する
      if (state.players.length == 1) {
        roomManager.updateRound();
      } else {
        io.to(state.roomId).emit('game:turn', {
          currentPlayerId: state.players[state.currentTurnIndex % state.players.length].id,
          currentRoundIndex: state.currentRoundIndex,
          currentTurnIndex: state.currentTurnIndex,
        } as GameTurnUpdateData);
      }
    });

    // 移動・探索
    socket.on('game:move-player', ({ roomId, playerId, newPosition }) => {
      const state = activeRooms.get(roomId);
      if (!state) return;
      const param = gameParams[state.gameId];

      const roomManager = new RoomManager(io, param, state);
      const player = state?.players.find((p) => p.id === playerId);
      if (player && state) {
        player.position = newPosition;
        const updated = markCellAsExplored(state, state.gameId, roomId, newPosition);

        roomManager.applyCellEffect(
          playerId,
          newPosition,
          param?.cellEffects,
          (pId, rId, amt) => roomManager.acquireResource(pId, rId, amt),
          (pId, tId) => roomManager.acquireToken(roomId, pId, tId),
          ({ message, color }) => io.to(roomId).emit('client:show-popup', { message, color, timestamp: Date.now() }),
        );
        roomManager.emitPlayerUpdate();
        if (updated) io.to(roomId).emit('board-update', state.exploredCells);
      }
    });

    socket.on('game:explore-cell', ({ roomId, targetPosition }) => {
      const state = activeRooms.get(roomId);
      if (state && markCellAsExplored(state, state.gameId, roomId, targetPosition)) {
        io.to(roomId).emit('board-update', state.exploredCells);
      }
    });

    socket.on('game:unexplore-cell', ({ roomId, targetPosition }) => {
      const state = activeRooms.get(roomId);
      if (state && unmarkCellAsExplored(state, state.gameId, roomId, targetPosition)) {
        io.to(roomId).emit('board-update', state.exploredCells);
      }
    });

    // カードを引く
    socket.on('deck:draw', (data: DeckDrawData) => {
      const { roomId, deckId, playerId, drawCondition } = data;
      const state = activeRooms.get(roomId);

      if (!state || playerId === null) return;
      const param = gameParams[state.gameId];
      const roomManager = new RoomManager(io, param, state);

      if (playerId && state.holdCards[playerId]) {
        server_log(
          'card',
          state.gameId,
          state.roomId,
          `${playerId} はカードをホールドしているので、カードを引くことができません`,
        );
        return;
      }

      const success = roomManager.drawCard(deckId, drawCondition, playerId);
      if (!success) return;

      // カスタムフック
      param?.onDeckDraw?.(state, roomManager, data);
    });

    // デッキシャッフル
    socket.on('deck:shuffle', ({ roomId, deckId }) => {
      const state = activeRooms.get(roomId);
      if (!state) return;
      const param = gameParams[state.gameId];
      const roomManager = new RoomManager(io, param, state);

      shuffleDeck(roomId, deckId);
      roomManager.emitDeckUpdate(deckId);
    });

    socket.on('deck:reset', ({ roomId, deckId }) => {
      const state = activeRooms.get(roomId);
      if (!state) return;
      const param = gameParams[state.gameId];
      const roomManager = new RoomManager(io, param, state);

      server_log('deck', state.gameId, roomId, `${deckId} を山札に戻した`);
      state.decks[deckId].forEach((c) => {
        if (c.location === 'discard') {
          c.location = 'deck';
          c.isFaceUp = false;
          c.ownerId = null;
        }
      });
      state.discardPile[deckId] = [];
      shuffleDeck(roomId, deckId);
      roomManager.emitDeckUpdate(deckId);
    });

    // カードプレイ
    socket.on('card:play', (data: CardPlayData) => {
      const state = activeRooms.get(data.roomId);
      if (!state) return;
      const param = gameParams[state.gameId];
      const roomManager = new RoomManager(io, param, state);
      roomManager.playCard(data);
    });

    // カードホールド
    socket.on('card:hold', ({ roomId, playerId, cardIdsbyDeck }: CardHoldData) => {
      const state = activeRooms.get(roomId);
      if (!state) return;
      const param = gameParams[state.gameId];
      const roomManager = new RoomManager(io, param, state);

      const player = state.players.find((p) => p.id === playerId);
      if (player) {
        state.holdCards[player.id] = state.holdCards[player.id] || {};
        Object.entries(cardIdsbyDeck).forEach(([deckId, cardIds]) => {
          const ids = Array.isArray(cardIds) ? cardIds : [cardIds];
          state.holdCards[player.id][deckId] = ids;
          server_log('card', state.gameId, state.roomId, `${playerId} がカード [${cardIds}] をホールドしました`);
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

    // カード公開
    socket.on('card:reveal', ({ roomId, playerId, cardIds }) => {
      const state = activeRooms.get(roomId);
      if (!state) return;
      const param = gameParams[state.gameId];
      const roomManager = new RoomManager(io, param, state);

      const p = state?.players.find((p) => p.id === playerId);
      if (p) {
        const ids = Array.isArray(cardIds) ? cardIds : [cardIds];
        p.cards.forEach((c) => {
          if (ids.includes(c.id)) c.isFaceUp = true;
        });
        roomManager.emitPlayerUpdate();
      }
    });

    // カード位置同期
    socket.on('card:move-on-field', ({ roomId, deckId, cardId, coordinate }) => {
      const state = activeRooms.get(roomId);
      if (!state) return;
      const param = gameParams[state.gameId];
      const roomManager = new RoomManager(io, param, state);

      const card = state?.decks[deckId]?.find((c) => c.id === cardId);
      if (card) {
        card.coordinate = coordinate;
        roomManager.emitDeckUpdate(deckId);
      }
    });

    // フィールドから「手札」または「捨て札」へ移動
    socket.on('card:move-from-field', (data: CardMoveFromFieldData) => {
      const { roomId, deckId, cardId, playerId } = data;
      const state = activeRooms.get(roomId);
      if (!state || !playerId) return;
      const param = gameParams[state.gameId];

      const roomManager = new RoomManager(io, param, state);

      if (state.holdCards[playerId]) {
        server_log(
          'card',
          state.gameId,
          state.roomId,
          `${playerId} はカードをホールドしているので、カードを移動できません`,
        );
        return;
      }

      const success = roomManager.moveFromField(deckId, cardId, playerId);
      if (!success) return;
    });

    // トークン
    socket.on('token:aquire', ({ roomId, tokenStoreId, tokenId }: TokenAcquireData) => {
      const state = activeRooms.get(roomId);
      if (!state) return;
      const param = gameParams[state.gameId];
      const roomManager = new RoomManager(io, param, state);

      const player = state?.players.find((p) => p.socketId === socket.id);
      if (state && player) {
        roomManager.acquireToken(tokenStoreId, tokenId, player.id);
        roomManager.emitPlayerUpdate();
      }
    });

    // ダイス
    socket.on('dice:roll', ({ roomId, diceId, sides }) => {
      const state = activeRooms.get(roomId);
      if (!state) return;
      const val = Math.floor(Math.random() * sides) + 1;

      server_log('dice', state.gameId, roomId, `Dice ${diceId} rolled. Result: ${val}`);
      io.to(roomId).emit(`dice:rolled:${roomId}:${diceId}`, val);
    });

    // タイマー・その他同期
    socket.on('timer:start', ({ duration, roomId }) => {
      const state = activeRooms.get(roomId);
      if (!state) return;
      stopTimer(roomId, state.gameId);
      let rem = duration;
      io.to(roomId).emit('timer:start', { duration, roomId });
      const tick = () => {
        if (rem <= 0) {
          stopTimer(roomId, state.gameId);
          io.to(roomId).emit('timer:finish', { roomId });
          return;
        }
        io.to(roomId).emit('timer:update', { remaining: rem, roomId });
        rem--;
        roomTimers.set(roomId, setTimeout(tick, 1000));
      };
      tick();
    });

    socket.on('cursor:move', ({ roomId, x, y }) => {
      socket.to(roomId).emit('cursor:update', { playerId: socket.id, x, y });
    });

    socket.on('draggable:moved', (data: DraggableMovedData) => {
      const { roomId, ...move } = data;
      socket.to(roomId).emit('draggable:update', move);
    });

    // 次のターン
    socket.on('game:next-turn', ({ roomId }: GameNextTrunData) => {
      const state = activeRooms.get(roomId);
      if (!state) return;
      const param = gameParams[state.gameId];
      const roomManager = new RoomManager(io, param, state);
      roomManager.updateTurn();
    });

    // 次のラウンド
    socket.on('game:next-round', ({ roomId }: GameNextRoundData) => {
      const state = activeRooms.get(roomId);
      if (!state) return;
      const param = gameParams[state.gameId];
      const roomManager = new RoomManager(io, param, state);
      roomManager.updateRound();
    });

    // スコア加算
    socket.on('room:player:add-score', ({ roomId, targetPlayerId, points }) => {
      const state = activeRooms.get(roomId);
      if (!state) return;
      const param = gameParams[state.gameId];
      const roomManager = new RoomManager(io, param, state);
      roomManager.addScore(targetPlayerId, points);
    });

    // リソース加算
    socket.on('room:player:update-resource', ({ roomId, playerId, resourceId, amount }) => {
      const state = activeRooms.get(roomId);
      if (!state) return;
      const param = gameParams[state.gameId];
      const roomManager = new RoomManager(io, param, state);
      roomManager.acquireResource(playerId, resourceId, amount);
    });

    // --- カスタムイベント ---
    const customEvents = options.customEvents ? options.customEvents() : {};
    for (const [event, handler] of Object.entries(customEvents)) {
      socket.on(event, (data) => {
        try {
          (handler as Function)(socket, data);
        } catch (err) {
          console.log('warn', 'Custom Event Error', err);
        }
      });
    }

    socket.on('disconnect', () => {
      for (const [id, state] of activeRooms.entries()) {
        const idx = state.players.findIndex((p) => p.socketId === socket.id);
        if (idx !== -1) {
          state.players.splice(idx, 1);
          if (state.players.length === 0) {
            activeRooms.delete(id);
            io.emit('lobby:room-update');
          } else {
            const param = gameParams[state.gameId];
            const roomManager = new RoomManager(io, param, state);
            roomManager.emitPlayerUpdate();
          }
          break;
        }
      }
    });
  });
}
