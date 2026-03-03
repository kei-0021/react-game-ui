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

import { DeckId, PlayerId, ResourceId, RoomId, TokenId } from '@/types/definition.js';
import { GameParam, RoomState } from '@/types/server.js';
import {
  CardMoveFromFieldData,
  CardPlayData,
  DeckDrawData,
  DeckUpdateData,
  DraggableMovedData,
  GameNextTrunData,
  GamePhaseUpdateData,
  GameTurnUpdateData,
  RoomJoinData,
  RoomMeta,
} from '@/types/socketData.js';
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

  const decks: Record<string, Card[]> = {};
  const drawnCards: Record<string, Card[]> = {};
  const playFieldCards: Record<string, Card[]> = {};
  const discardPile: Record<string, Card[]> = {};

  const tokenStores: Record<string, TokenStore> = {};

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
    drawnCards[deck.deckId] = [];
    playFieldCards[deck.deckId] = [];
    discardPile[deck.deckId] = [];
    server_log('deck', param.gameId, roomId, `デッキ "${deck.deckId}" を初期化完了`);
  });

  initialTokenStores.forEach((store: TokenStore) => {
    tokenStores[store.tokenStoreId] = store;
  });

  const roomState: RoomState = {
    roomId,
    gameId: param.gameId || '不明なゲーム',
    createdAt: Date.now(),
    maxPlayers: param.maxPlayers,
    currentTurnIndex: 0,
    currentRoundIndex: 0,
    currentPhase: param.initialPhase,
    players: [],
    decks,
    drawnCards,
    playFieldCards,
    discardPile,
    board: Cells,
    exploredCells: [],
    tokenStores: tokenStores,
  };

  activeRooms.set(roomId, roomState);
  server_log('room', roomState.gameId, roomId, `ルーム初期化完了`);
  return roomState;
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
  const emitPlayerUpdate = (roomId: RoomId) => {
    const roomState = activeRooms.get(roomId);
    if (roomState) io.to(roomId).emit('players:update', roomState.players);
  };

  const emitDeckUpdate = (roomId: RoomId, deckId: DeckId) => {
    const roomState = activeRooms.get(roomId);
    if (!roomState) return;

    const updateData: DeckUpdateData = {
      currentDeck: roomState.decks[deckId].filter((c) => c.location === 'deck'),
      drawnCards: roomState.drawnCards[deckId],
      playFieldCards: roomState.playFieldCards[deckId],
      discardPile: roomState.discardPile[deckId],
    };

    io.to(roomId).emit(`deck:update:${roomId}:${deckId}`, updateData);
  };

  const updatePlayerResource = (roomId: RoomId, playerId: PlayerId, resourceId: ResourceId, amount: number) => {
    const roomState = activeRooms.get(roomId);
    const player = roomState?.players.find((p) => p.id === playerId);
    const resource = player?.resources?.find((r) => r.resourceId === resourceId);
    if (resource) {
      resource.currentValue = Math.min(resource.maxValue, Math.max(0, resource.currentValue + amount));
      server_log('resource', roomState!.gameId, roomId, `${player!.name}: ${resource.name} 更新`);
      emitPlayerUpdate(roomId);
      return true;
    }
    return false;
  };

  const updatePlayerToken = (roomId: RoomId, playerId: PlayerId, tokenId: TokenId, amount: number) => {
    const roomState = activeRooms.get(roomId);
    const player = roomState?.players.find((p) => p.id === playerId);
    const token = player?.tokens?.find((t) => t.id === tokenId);
    if (token) {
      token.count = Math.max(0, (token.count || 0) + amount);
      server_log('token', roomState!.gameId, roomId, `${player!.name}: ${tokenId} 更新`);
      emitPlayerUpdate(roomId);
      return true;
    }
    return false;
  };

  const stopTimer = (roomId: RoomId, gameId: string) => {
    const timer = roomTimers.get(roomId);
    if (timer) {
      clearTimeout(timer);
      roomTimers.delete(roomId);
      server_log('timer', gameId, roomId, `タイマー停止`);
    }
  };

  const shuffleDeck = (roomId: RoomId, deckId: DeckId) => {
    const roomState = activeRooms.get(roomId);
    if (!roomState || !roomState.decks[deckId]) return;

    server_log('deck', roomState.gameId, roomId, `${deckId} をシャッフル`);
    const currentDeck = roomState.decks[deckId].filter((c) => c.location === 'deck');
    const otherCards = roomState.decks[deckId].filter((c) => c.location !== 'deck');
    for (let i = currentDeck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [currentDeck[i], currentDeck[j]] = [currentDeck[j], currentDeck[i]];
    }
    roomState.decks[deckId] = currentDeck.concat(otherCards);
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
      let roomState = activeRooms.get(roomId);
      const param = gameParams[gameId] || options;

      if (!roomState) {
        roomState = initializeRoom(roomId, { ...param, gameId: gameId });
        Object.keys(roomState.decks).forEach((id) => shuffleDeck(roomId, id));
        io.emit('lobby:room-update');
      }

      await socket.join(roomId);
      const { decks } = roomState;
      let player = roomState.players.find((p) => p.socketId === socket.id);

      if (!player) {
        player = {
          id: `${roomId}_p${roomState.players.length + 1}`,
          name: playerName?.trim() || `Player ${roomState.players.length + 1}`,
          color: generateColorFromId(`${roomId}_p${roomState.players.length + 1}`),
          socketId: socket.id,
          cards: [],
          score: 0,
          resources: JSON.parse(JSON.stringify(param.initialResources || [])),
          tokens: JSON.parse(JSON.stringify(param.initialTokens || [])),
          position: { row: 0, col: 0 },
        };
        roomState.players.push(player);
        server_log('game', param.gameId, roomId, `${player.name} (${player.id})が参加しました`);

        const hand = param.initialHand;
        if (hand && decks[hand.deckId]) {
          const target = decks[hand.deckId];
          for (let i = 0; i < hand.count; i++) {
            const idx = target.findIndex((c) => c.location === 'deck');
            if (idx === -1) break;

            const card = target[idx];
            card.location = 'hand';
            card.ownerId = player.id;
            card.isFaceUp = card.drawCondition[1] === 'face' ? true : false;

            player.cards.push(card);
          }
          server_log(
            'deck',
            param.gameId,
            roomId,
            `デッキ "${hand.deckId}" から初期手札 ${hand.count}枚 を配布しました`,
          );
        }
      } else {
        player.socketId = socket.id;
      }

      socket.emit('player:assign-id', player.id);
      Object.values(roomState.board).forEach((board) => socket.emit('game:init-board', board));
      emitPlayerUpdate(roomId);
      Object.keys(decks).forEach((id) => emitDeckUpdate(roomId, id));

      server_log(
        'game',
        roomState.gameId,
        roomId,
        `ターン更新 (Player: ${roomState.players[roomState.currentTurnIndex]?.name}, RoundIndex: ${roomState.currentRoundIndex})`,
      );
      io.to(roomId).emit('game:turn', {
        currentPlayerId: roomState.players[roomState.currentTurnIndex]?.id,
        currentRoundIndex: roomState.currentRoundIndex,
        currentTurnIndex: roomState.currentTurnIndex,
      } as GameTurnUpdateData);

      if (roomState.exploredCells.length > 0) socket.emit('board-update', roomState.exploredCells);
    });

    // 移動・探索
    socket.on('game:move-player', ({ roomId, playerId, newPosition }) => {
      const roomState = activeRooms.get(roomId);
      if (!roomState) return;

      const roomManager = new RoomManager(roomState);
      const player = roomState?.players.find((p) => p.id === playerId);
      if (player && roomState) {
        player.position = newPosition;
        const updated = markCellAsExplored(roomState, roomState.gameId, roomId, newPosition);
        const preset = gameParams[roomState.gameId];
        roomManager.applyCellEffect(
          playerId,
          newPosition,
          preset?.cellEffects,
          (pId, rId, amt) => updatePlayerResource(roomId, pId, rId, amt),
          (pId, tId, amt) => updatePlayerToken(roomId, pId, tId, amt),
          ({ message, color }) => io.to(roomId).emit('client:show-popup', { message, color, timestamp: Date.now() }),
        );
        emitPlayerUpdate(roomId);
        if (updated) io.to(roomId).emit('board-update', roomState.exploredCells);
      }
    });

    socket.on('game:explore-cell', ({ roomId, targetPosition }) => {
      const roomState = activeRooms.get(roomId);
      if (roomState && markCellAsExplored(roomState, roomState.gameId, roomId, targetPosition)) {
        io.to(roomId).emit('board-update', roomState.exploredCells);
      }
    });

    socket.on('game:unexplore-cell', ({ roomId, targetPosition }) => {
      const roomState = activeRooms.get(roomId);
      if (roomState && unmarkCellAsExplored(roomState, roomState.gameId, roomId, targetPosition)) {
        io.to(roomId).emit('board-update', roomState.exploredCells);
      }
    });

    // カードを引く
    socket.on('deck:draw', (data: DeckDrawData) => {
      const { roomId, deckId, playerId, drawCondition } = data;
      const [targetLocation, targetState] = drawCondition;

      const roomState = activeRooms.get(roomId);
      if (!roomState) return;

      const param = gameParams[roomState.gameId];
      const roomManager = new RoomManager(roomState);
      const { decks } = roomState;
      // デッキにあるカードのみをフィルタリング
      const currentDeck = decks[deckId].filter((c) => c.location === 'deck');
      if (!currentDeck.length) {
        server_log('warn', roomState.gameId, roomId, `デッキ ${deckId} は空です。`);
        return;
      }

      // 先頭のカードを取得
      const card = currentDeck[0];

      let destination = '';

      // 状態（表裏）を反映
      card.isFaceUp = targetState === 'face';

      // --- 移動ロジック開始 ---

      // A. 引いた瞬間に捨て札にする場合
      if (targetLocation === 'discard') {
        card.location = 'discard';
        card.ownerId = null;
        roomState.discardPile[deckId].push(card);
        destination = 'discard';
      }
      // B. プレイヤーを指定して引く場合
      else if (playerId && targetLocation === 'hand') {
        const player = roomState.players.find((p) => p.id === playerId);
        if (player) {
          player.cards = player.cards || [];
          card.location = 'hand';
          card.ownerId = playerId;
          player.cards.push(card);
          destination = playerId;
        }
      }
      // C. 場に出す場合
      else {
        card.ownerId = null;
        card.location = 'field';
        roomState.playFieldCards[deckId].push(card);
        destination = 'field';
      }

      server_log(
        'deck',
        roomState.gameId,
        roomId,
        `DRAW: ${card.name} (ID:${card.id}) (deck -> ${destination}, state: ${targetState})`,
      );

      // カスタムフック処理
      const onDeckDraw = param?.onDeckDraw;
      if (onDeckDraw) {
        onDeckDraw(roomState, roomManager, data);
      }

      if (roomManager.hasPhaseChanged) {
        io.to(roomId).emit('game:phase:update', {
          newPhase: roomState.currentPhase,
        } as GamePhaseUpdateData);
      }

      emitDeckUpdate(roomId, deckId);
      emitPlayerUpdate(roomId);
    });

    // デッキシャッフル
    socket.on('deck:shuffle', ({ roomId, deckId }) => {
      const roomState = activeRooms.get(roomId);
      if (!roomState) return;

      shuffleDeck(roomId, deckId);
      emitDeckUpdate(roomId, deckId);
    });

    socket.on('deck:reset', ({ roomId, deckId }) => {
      const roomState = activeRooms.get(roomId);
      if (!roomState) return;
      server_log('deck', roomState.gameId, roomId, `${deckId} を山札に戻した`);
      roomState.decks[deckId].forEach((c) => {
        if (c.location === 'discard') {
          c.location = 'deck';
          c.isFaceUp = false;
          c.ownerId = null;
        }
      });
      roomState.discardPile[deckId] = [];
      shuffleDeck(roomId, deckId);
      emitDeckUpdate(roomId, deckId);
    });

    // フィールドから「手札」または「捨て札」へ移動
    socket.on('card:move-from-field', ({ roomId, deckId, cardId, playerId }: CardMoveFromFieldData) => {
      const roomState = activeRooms.get(roomId);
      if (!roomState) return;
      const { decks, playFieldCards } = roomState;
      // 対象カードを特定
      const card = decks[deckId]?.find((c) => c.id === cardId);
      if (!card) return;
      // PlayFieldから削除（共通処理）
      const fieldIndex = playFieldCards[deckId]?.findIndex((c) => c.id === cardId);
      if (fieldIndex !== -1) {
        playFieldCards[deckId].splice(fieldIndex, 1);
      }
      // 行き先の判定と処理
      if (playerId) {
        // --- 手札に戻す場合 ---
        const player = roomState.players.find((p) => p.id === playerId);
        if (player) {
          card.location = 'hand';
          card.ownerId = playerId;
          card.isFaceUp = card.fieldBackCondition[1] === 'face' ? true : false;
          player.cards = player.cards || [];
          player.cards.push(card);
          server_log(
            'card',
            roomState.gameId,
            roomId,
            `Return: ${card.name} -> Player:${playerId}, state: ${card.isFaceUp}`,
          );
        }
      } else {
        // --- 捨て札に送る場合 ---
        card.location = 'discard';
        card.ownerId = null;
        card.isFaceUp = card.fieldBackCondition[1] === 'face' ? true : false;
        roomState.discardPile[deckId].push(card);
        server_log('card', roomState.gameId, roomId, `Return: ${card.name} -> discard, state: ${card.isFaceUp}`);
      }
      emitDeckUpdate(roomId, deckId);
      emitPlayerUpdate(roomId);
    });

    // カード位置同期
    socket.on('card:move-on-field', ({ roomId, deckId, cardId, coordinate }) => {
      const roomState = activeRooms.get(roomId);
      const card = roomState?.decks[deckId]?.find((c) => c.id === cardId);
      if (card) {
        card.coordinate = coordinate;
        emitDeckUpdate(roomId, deckId);
      }
    });

    socket.on('card:play', (data: CardPlayData) => {
      const { roomId, deckId, cardIds, playerId, playLocation = 'field', coordinate } = data;

      const roomState = activeRooms.get(roomId);
      if (!roomState) return;

      const param = gameParams[roomState.gameId];
      const roomManager = new RoomManager(roomState);
      const ids = Array.isArray(cardIds) ? cardIds : [cardIds];

      ids.forEach((id) => {
        const card = roomState.decks[deckId]?.find((c) => c.id === id);
        if (!card) return;

        if (playerId) {
          const p = roomState.players.find((p) => p.id === playerId);
          if (p) p.cards = p.cards.filter((c) => c.id !== id);
        }

        card.location = playLocation as any;
        if (coordinate?.x != null && coordinate?.y != null) {
          card.coordinate = coordinate;
        }
        card.isFaceUp = true;

        roomState.playFieldCards[deckId] = roomState.playFieldCards[deckId].filter((c) => c.id !== id);
        roomState.discardPile[deckId] = roomState.discardPile[deckId].filter((c) => c.id !== id);

        if (playLocation === 'discard') {
          roomState.discardPile[deckId].push(card);
        } else {
          roomState.playFieldCards[deckId].push(card);
        }

        server_log('card', roomState.gameId, roomId, `"${card.name}" をプレイした`);

        // カード効果
        const effect = param?.cardEffects?.[card.name];
        if (effect) {
          server_log('card', roomState.gameId, roomId, `カード効果発揮: ${card.name} by ${playerId}`);
          effect({
            playerId,
            updateResource: (resourceId: string, amount: number) =>
              updatePlayerResource(roomId, playerId, resourceId, amount),
            updateToken: (tokenId: string, amount: number) => updatePlayerToken(roomId, playerId, tokenId, amount),
          });
        }
      });

      // カスタムフック処理
      const onCardPlay = param?.onCardPlay;
      if (onCardPlay) {
        onCardPlay(roomState, roomManager, data);
      }

      if (roomManager.hasPhaseChanged) {
        io.to(roomId).emit('game:phase:update', {
          newPhase: roomState.currentPhase,
        } as GamePhaseUpdateData);
      }

      // 更新通知
      emitDeckUpdate(roomId, deckId);
      emitPlayerUpdate(roomId);
    });

    // ドラッグ中も監視
    socket.on('card:move-on-field', ({ roomId, deckId, cardId, coordinate }) => {
      const roomState = activeRooms.get(roomId);
      const card = roomState?.decks[deckId]?.find((c) => c.id === cardId);
      if (card && coordinate) {
        card.coordinate = coordinate;
        emitDeckUpdate(roomId, deckId);
      }
    });

    socket.on('card:reveal', ({ roomId, playerId, cardIds }) => {
      const roomState = activeRooms.get(roomId);
      const p = roomState?.players.find((p) => p.id === playerId);
      if (p) {
        const ids = Array.isArray(cardIds) ? cardIds : [cardIds];
        p.cards.forEach((c) => {
          if (ids.includes(c.id)) c.isFaceUp = true;
        });
        emitPlayerUpdate(roomId);
      }
    });

    // トークン・ダイス
    socket.on('game:acquire-token', ({ roomId, tokenStoreId, tokenId }) => {
      const roomState = activeRooms.get(roomId);
      if (!roomState) return;

      const player = roomState?.players.find((p) => p.socketId === socket.id);
      const roomManager = new RoomManager(roomState);

      if (roomState && player && roomManager.acquireToken(tokenStoreId, tokenId, player.id)) {
        const store = roomManager.getTokenStore(tokenStoreId);
        if (!store) return;
        if (store) io.to(roomId).emit(`token-store:update:${roomId}:${tokenStoreId}`, store.tokens);
        emitPlayerUpdate(roomId);
      }
    });

    socket.on('dice:roll', ({ roomId, diceId, sides }) => {
      const roomState = activeRooms.get(roomId);
      if (!roomState) return;
      const val = Math.floor(Math.random() * sides) + 1;

      server_log('dice', roomState.gameId, roomId, `Dice ${diceId} rolled. Result: ${val}`);
      io.to(roomId).emit(`dice:rolled:${roomId}:${diceId}`, val);
    });

    // タイマー・その他同期
    socket.on('timer:start', ({ duration, roomId }) => {
      const roomState = activeRooms.get(roomId);
      if (!roomState) return;
      stopTimer(roomId, roomState.gameId);
      let rem = duration;
      io.to(roomId).emit('timer:start', { duration, roomId });
      const tick = () => {
        if (rem <= 0) {
          stopTimer(roomId, roomState.gameId);
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
      const roomState = activeRooms.get(roomId);
      if (!roomState) return;

      const param = gameParams[roomState.gameId];

      if (roomState.players.length === 0) return;

      // カスタムフック処理
      if (typeof param.checkGameEnd === 'function' && param.checkGameEnd(roomState)) {
        const results = typeof param.onGameEnd === 'function' ? param.onGameEnd(roomState) : { message: 'Game Over' };
        io.to(roomId).emit('game:end', results);
        return;
      }

      // ターンが一周した場合は次のラウンドへ移行する
      const nextIndex = (roomState.currentTurnIndex + 1) % roomState.players.length;
      if (nextIndex === 0) {
        roomState.currentRoundIndex += 1;
        // カスタムフック処理
        const onNextRound = param?.onNextRound;
        if (onNextRound) {
          const roomManager = new RoomManager(roomState);
          onNextRound(roomState, roomManager);
        }
      }

      roomState.currentTurnIndex = nextIndex;
      const currentPlayer = roomState.players[roomState.currentTurnIndex];

      server_log(
        'game',
        roomState.gameId,
        roomId,
        `ターン更新 (Player: ${roomState.players[roomState.currentTurnIndex]?.name}, RoundIndex: ${roomState.currentRoundIndex})`,
      );
      io.to(roomId).emit('game:turn', {
        currentPlayerId: currentPlayer?.id,
        currentRoundIndex: roomState.currentRoundIndex,
        currentTurnIndex: roomState.currentTurnIndex,
      } as GameTurnUpdateData);
    });

    // スコア加算
    socket.on('room:player:add-score', ({ roomId, targetPlayerId, points }) => {
      const roomState = activeRooms.get(roomId);
      if (!roomState) return;

      const roomManager = new RoomManager(roomState);
      const success = roomManager.addScore(targetPlayerId, points);
      if (success) {
        emitPlayerUpdate(roomId);
      }
    });

    // リソース加算
    socket.on('room:player:update-resource', ({ roomId, playerId, resourceId, amount }) => {
      const roomState = activeRooms.get(roomId);
      if (!roomState) return;

      updatePlayerResource(roomId, playerId, resourceId, amount);
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
      for (const [id, roomState] of activeRooms.entries()) {
        const idx = roomState.players.findIndex((p) => p.socketId === socket.id);
        if (idx !== -1) {
          roomState.players.splice(idx, 1);
          if (roomState.players.length === 0) {
            activeRooms.delete(id);
            io.emit('lobby:room-update');
          } else {
            emitPlayerUpdate(id);
          }
          break;
        }
      }
    });
  });
}
