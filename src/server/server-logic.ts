import { Server, Socket } from 'socket.io';
import {
  applyCellEffect,
  Coordinate,
  createRandomBoard,
  GameSettings,
  GameState,
  generateColorFromId,
  LOG_CATEGORIES,
  markCellAsExplored,
  MockGameState,
  Position,
  RoomGameInfo,
  server_log,
  unmarkCellAsExplored,
} from './server-utils.js';

import type { GameServerOptions } from './server.js';

import { CardLocation } from '@/types/cardLocation.js';
import { CardId, DeckId, GameName, PlayerId, ResourceId, RoomId, TokenId } from '@/types/definition.js';
import type { Card } from '../types/card.js';
import type { Deck } from '../types/deck.js';

// ------------------------------------
// ルーム・タイマー状態管理
// ------------------------------------
const activeRooms = new Map<string, RoomGameInfo>();
const roomTimers = new Map<string, NodeJS.Timeout>();

/**
 * ルームの基本的なメタ情報を取得する
 */
function getRoomMeta(roomId: RoomId) {
  const roomInfo = activeRooms.get(roomId);
  if (!roomInfo) return null;

  return {
    id: roomId,
    gameName: roomInfo.gameName,
    playerCount: roomInfo.gameStateInstance.players.length,
    maxPlayers: 4,
    createdAt: roomInfo.createdAt,
  };
}

/**
 * ルームのゲームロジックを初期化する
 */
function initializeRoom(roomId: RoomId, settings: GameSettings): RoomGameInfo {
  const initialDecks = settings.initialDecks || [];
  const initialResources = settings.initialResources || [];
  const initialTokenStores = Array.isArray(settings.initialTokenStore) ? settings.initialTokenStore : [];
  const initialTokens = settings.initialTokens || [];
  const initialBoard = settings.initialBoard || [];

  const Cells = createRandomBoard(initialBoard);

  const initialState: GameState = {
    players: [],
    initialResources,
    initialTokenStores,
    initialTokens,
    board: Cells,
    exploredCells: [],
    turn: 1,
  };

  const gameStateInstance = new MockGameState(initialState, initialTokenStores);

  const decks: Record<string, Card[]> = {};
  const drawnCards: Record<string, Card[]> = {};
  const playFieldCards: Record<string, Card[]> = {};
  const discardPile: Record<string, Card[]> = {};

  initialDecks.forEach((deck: Deck) => {
    const cards: Card[] = (deck.cards || []).map((c, index) => ({
      ...c,
      deckId: deck.deckId,
      backColor: deck.backColor,
      instanceId: `${roomId}_${deck.deckId}_${index}`,
      location: 'deck',
      ownerId: null,
    }));
    decks[deck.deckId] = cards;
    drawnCards[deck.deckId] = [];
    playFieldCards[deck.deckId] = [];
    discardPile[deck.deckId] = [];
  });

  const roomInfo: RoomGameInfo = {
    roomId,
    createdAt: Date.now(),
    gameName: settings.name || '不明なゲーム',
    currentTurnIndex: 0,
    currentRoundIndex: 0,
    decks,
    drawnCards,
    playFieldCards,
    discardPile,
    gameStateInstance,
    checkGameEnd: settings.checkGameEnd,
    onGameEnd: settings.onGameEnd,
  };

  activeRooms.set(roomId, roomInfo);
  server_log('room', roomInfo.gameName, roomId, `ルーム初期化完了`);
  return roomInfo;
}

// ------------------------------------
// サーバー本体
// ------------------------------------
export function initGameServer(io: Server, options: GameServerOptions = {}) {
  const gamePresets = options.gamePresets || {};

  if (options.initialLogCategories) {
    Object.assign(LOG_CATEGORIES, options.initialLogCategories);
    console.log('[log] ログカテゴリをオプションで初期化しました。', LOG_CATEGORIES);
  }

  const cellEffects = options.cellEffects || {};

  // --- 内部ヘルパー ---
  const emitPlayerUpdate = (roomId: RoomId) => {
    const roomInfo = activeRooms.get(roomId);
    if (roomInfo) io.to(roomId).emit('players:update', roomInfo.gameStateInstance.players);
  };

  const emitDeckUpdate = (roomId: RoomId, deckId: DeckId) => {
    const roomInfo = activeRooms.get(roomId);
    if (!roomInfo) return;
    io.to(roomId).emit(`deck:update:${roomId}:${deckId}`, {
      currentDeck: roomInfo.decks[deckId].filter((c) => c.location === 'deck'),
      drawnCards: roomInfo.drawnCards[deckId],
      playFieldCards: roomInfo.playFieldCards[deckId],
      discardPile: roomInfo.discardPile[deckId],
    });
    emitPlayerUpdate(roomId);
  };

  const broadcastExploredUpdate = (roomId: RoomId) => {
    const roomInfo = activeRooms.get(roomId);
    if (roomInfo) io.to(roomId).emit('board-update', roomInfo.gameStateInstance.exploredCells);
  };

  const addScore = (roomId: RoomId, playerId: PlayerId, points: number) => {
    const roomInfo = activeRooms.get(roomId);
    if (!roomInfo) return;
    const player = roomInfo.gameStateInstance.players.find((p) => p.id === playerId);
    if (player) {
      player.score = (player.score || 0) + points;
      emitPlayerUpdate(roomId);
    }
  };

  const updatePlayerResource = (roomId: RoomId, playerId: PlayerId, resourceId: ResourceId, amount: number) => {
    const roomInfo = activeRooms.get(roomId);
    if (!roomInfo) return false;
    const player = roomInfo.gameStateInstance.players.find((p) => p.id === playerId);
    const resource = player?.resources?.find((r) => r.id === resourceId);
    if (resource) {
      resource.currentValue = Math.min(resource.maxValue, Math.max(0, resource.currentValue + amount));
      emitPlayerUpdate(roomId);
      return true;
    }
    return false;
  };

  const updatePlayerToken = (roomId: RoomId, playerId: PlayerId, tokenId: TokenId, amount: number) => {
    const roomInfo = activeRooms.get(roomId);
    if (!roomInfo) return false;
    const player = roomInfo.gameStateInstance.players.find((p) => p.id === playerId);
    const token = player?.tokens?.find((t) => t.id === tokenId);
    if (token) {
      token.count = Math.max(0, (token.count || 0) + amount);
      emitPlayerUpdate(roomId);
      return true;
    }
    return false;
  };

  const requirePopup = (roomId: RoomId, message: string, color: string = 'blue') => {
    io.to(roomId).emit('client:show-popup', { message, color, timestamp: Date.now() });
  };

  const shuffleDeck = (roomId: RoomId, deckId: DeckId) => {
    const roomInfo = activeRooms.get(roomId);
    if (!roomInfo || !roomInfo.decks[deckId]) return;
    const currentDeck = roomInfo.decks[deckId].filter((c) => c.location === 'deck');
    const otherCards = roomInfo.decks[deckId].filter((c) => c.location !== 'deck');
    for (let i = currentDeck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [currentDeck[i], currentDeck[j]] = [currentDeck[j], currentDeck[i]];
    }
    roomInfo.decks[deckId] = currentDeck.concat(otherCards);
  };

  const stopTimer = (roomId: RoomId, gameName: GameName) => {
    const timer = roomTimers.get(roomId);
    if (timer) {
      clearTimeout(timer);
      roomTimers.delete(roomId);
    }
  };

  // --------------------
  // Socket.IO 通信ロジック
  // --------------------
  io.on('connection', (socket: Socket) => {
    // ロビー機能
    socket.on('lobby:get-rooms', () => {
      const roomList = Array.from(activeRooms.keys()).map(getRoomMeta).filter(Boolean);
      socket.emit('lobby:rooms-list', roomList);
    });

    // ルーム参加
    socket.on('room:join', async ({ roomId, playerName, gamePresetId }: { roomId: RoomId; playerName?: string; gamePresetId: GameName }) => {
      if (!roomId) return;
      let roomInfo = activeRooms.get(roomId);

      const presetSettings = gamePresets[gamePresetId];
      const roomSettings = presetSettings || options;

      if (!roomInfo) {
        const finalSettings: GameSettings = {
          ...roomSettings,
          name: roomSettings.name || gamePresetId || 'Standard Game',
        };

        roomInfo = initializeRoom(roomId, finalSettings);

        Object.keys(roomInfo.decks).forEach((id) => shuffleDeck(roomId, id));
        io.emit('lobby:room-update');
      }

      await socket.join(roomId);

      const { gameStateInstance, decks } = roomInfo;
      let player = gameStateInstance.players.find((p) => p.socketId === socket.id);

      if (!player) {
        const playerId = `${roomId}_p${gameStateInstance.players.length + 1}`;
        player = {
          id: playerId,
          name: playerName?.trim() || `Player ${gameStateInstance.players.length + 1}`,
          color: generateColorFromId(playerId),
          socketId: socket.id,
          cards: [],
          score: 0,
          resources: JSON.parse(JSON.stringify(roomSettings.initialResources || [])),
          tokens: JSON.parse(JSON.stringify(roomSettings.initialTokens || [])),
          position: { row: 0, col: 0 },
        };
        gameStateInstance.players.push(player);

        const hand = roomSettings.initialHand;
        if (hand && decks[hand.deckId]) {
          const target = decks[hand.deckId];
          for (let i = 0; i < hand.count; i++) {
            const idx = target.findIndex((c) => c.location === 'deck');
            if (idx === -1) break;
            target[idx].location = 'hand';
            target[idx].ownerId = player.id;
            player.cards.push(target[idx]);
          }
        }
      } else {
        player.socketId = socket.id;
      }

      socket.emit('player:assign-id', player.id);
      socket.emit('game:init-board', gameStateInstance.board);
      Object.keys(decks).forEach((id) => emitDeckUpdate(roomId, id));
      emitPlayerUpdate(roomId);

      if (gameStateInstance.exploredCells.length > 0) {
        socket.emit('board-update', gameStateInstance.exploredCells);
      }
    });

    // 移動処理
    socket.on('game:move-player', ({ roomId, playerId, newPosition }: { roomId: RoomId; playerId: PlayerId; newPosition: Position }) => {
      const roomInfo = activeRooms.get(roomId);
      if (!roomInfo) return;

      const player = roomInfo.gameStateInstance.players.find((p) => p.id === playerId);
      if (player) {
        player.position = newPosition;
        const wasUpdated = markCellAsExplored(roomInfo.gameStateInstance, roomInfo.gameName, roomId, newPosition);

        applyCellEffect(
          roomInfo.gameStateInstance,
          roomInfo.gameName,
          roomId,
          playerId,
          newPosition,
          cellEffects,
          (pId, pts) => addScore(roomId, pId, pts),
          (pId, rId, amt) => updatePlayerResource(roomId, pId, rId, amt),
          (pId, tId, amt) => updatePlayerToken(roomId, pId, tId, amt),
          ({ message, color }) => requirePopup(roomId, message, color),
        );

        emitPlayerUpdate(roomId);
        if (wasUpdated) broadcastExploredUpdate(roomId);
      }
    });

    // 探索処理
    socket.on('game:explore-cell', ({ roomId, targetPosition }: { roomId: RoomId; targetPosition: Position }) => {
      const roomInfo = activeRooms.get(roomId);
      if (roomInfo && markCellAsExplored(roomInfo.gameStateInstance, roomInfo.gameName, roomId, targetPosition)) {
        broadcastExploredUpdate(roomId);
      }
    });

    socket.on('game:unexplore-cell', ({ roomId, targetPosition }: { roomId: RoomId; targetPosition: Position }) => {
      const roomInfo = activeRooms.get(roomId);
      if (roomInfo && unmarkCellAsExplored(roomInfo.gameStateInstance, roomInfo.gameName, roomId, targetPosition)) {
        broadcastExploredUpdate(roomId);
      }
    });

    // ダイス
    socket.on('dice:roll', ({ roomId, diceId, sides }: { roomId: RoomId; diceId: DeckId; sides: number }) => {
      const roomInfo = activeRooms.get(roomId);
      if (!roomInfo) {
        console.warn(`[${roomId}] ルームが見つかりません。処理を中断します。`);
        return;
      }
      const rollValue = Math.floor(Math.random() * sides) + 1;
      server_log('game', roomInfo.gameName, `[${roomId}] Dice ${diceId} rolled. Result: ${rollValue}`);
      io.to(roomId).emit(`dice:rolled:${roomId}:${diceId}`, rollValue);
    });

    // カードを引く
    socket.on(
      'deck:draw',
      ({ roomId, deckId, playerId, drawLocation = 'hand' }: { roomId: RoomId; deckId: DeckId; playerId: PlayerId; drawLocation: CardLocation }) => {
        const roomInfo = activeRooms.get(roomId);
        if (!roomInfo || !roomInfo.decks[deckId]) return;

        const deck = roomInfo.decks[deckId].filter((c) => c.location === 'deck');
        if (deck.length === 0) return;

        const card = deck[0];
        let destination = '';

        if (drawLocation === 'discard') {
          card.location = 'discard';
          roomInfo.discardPile[deckId].push(card);
          destination = 'discard';
        } else if (playerId) {
          const p = roomInfo.gameStateInstance.players.find((p) => p.id === playerId);
          if (p) {
            card.location = drawLocation as any;
            card.ownerId = playerId;
            p.cards.push(card);
            destination = playerId;
          }
        } else {
          card.location = 'field';
          roomInfo.playFieldCards[deckId].push(card);
          destination = 'field';
        }

        server_log('deck', roomInfo.gameName, roomId, `DRAW: ${card.name} (ID:${card.id}) (deck -> ${destination})`);

        emitDeckUpdate(roomId, deckId);
      },
    );

    // カード使用
    socket.on(
      'card:play',
      ({
        roomId,
        deckId,
        cardIds,
        playerId,
        playLocation = 'field',
        position: coordinate,
      }: {
        roomId: RoomId;
        deckId: DeckId;
        cardIds: CardId[];
        playerId: PlayerId;
        playLocation: CardLocation;
        position: Coordinate;
      }) => {
        const roomInfo = activeRooms.get(roomId);
        if (!roomInfo) return;

        const ids = Array.isArray(cardIds) ? cardIds : [cardIds];
        ids.forEach((id) => {
          const card = roomInfo.decks[deckId].find((c) => c.id === id);
          if (!card) return;

          if (playerId) {
            const p = roomInfo.gameStateInstance.players.find((p) => p.id === playerId);
            if (p) p.cards = p.cards.filter((c) => c.id !== id);
          }

          card.location = playLocation as any;
          card.coordinate = coordinate || { x: 50, y: 50 };
          card.isFaceUp = true;

          if (playLocation === 'discard') {
            roomInfo.discardPile[deckId].push(card);
          } else {
            roomInfo.playFieldCards[deckId].push(card);
          }

          const effect = (options as any).cardEffects?.[card.name];
          if (effect)
            effect({
              playerId,
              addScore: (pts: number) => addScore(roomId, playerId as string, pts),
              updateResource: (rId: string, amt: number) => updatePlayerResource(roomId, playerId as string, rId, amt),
            });
        });
        emitDeckUpdate(roomId, deckId);
      },
    );

    // フィールドから「手札」または「捨て札」へ移動
    socket.on(
      'card:move-from-field',
      ({ roomId, deckId, cardId, targetPlayerId = null }: { roomId: RoomId; deckId: DeckId; cardId: CardId; targetPlayerId: PlayerId | null }) => {
        const roomInfo = activeRooms.get(roomId);
        if (!roomInfo) return;

        const { decks, playFieldCards, gameStateInstance } = roomInfo;

        // 対象カードを特定
        const card = decks[deckId]?.find((c) => c.id === cardId);
        if (!card) return;

        // PlayFieldから削除（共通処理）
        const fieldIndex = playFieldCards[deckId]?.findIndex((c) => c.id === cardId);
        if (fieldIndex !== -1) {
          playFieldCards[deckId].splice(fieldIndex, 1);
        }

        // 行き先の判定と処理
        if (targetPlayerId) {
          // --- 手札に戻す場合 ---
          const player = gameStateInstance.players.find((p) => p.id === targetPlayerId);
          if (player) {
            card.location = 'hand';
            card.ownerId = targetPlayerId;
            card.isFaceUp = true; // 手札なので自分には見える
            player.cards = player.cards || [];
            player.cards.push(card);

            server_log('card', roomInfo.gameName, roomId, `Return: ${card.name} -> Player:${targetPlayerId}`);
          }
        } else {
          // --- 捨て札に送る場合 ---
          card.location = 'discard';
          card.ownerId = null;
          card.isFaceUp = true;
          roomInfo.discardPile[deckId].push(card);

          server_log('card', roomInfo.gameName, roomId, `Return: ${card.name} -> discard`);
        }

        emitDeckUpdate(roomId, deckId);
        emitPlayerUpdate(roomId);
      },
    );

    // トークン獲得
    socket.on('game:acquire-token', (payload) => {
      const { roomId, tokenStoreId, tokenId } = payload;
      const roomInfo = activeRooms.get(roomId);
      const player = roomInfo?.gameStateInstance.players.find((p) => p.socketId === socket.id);

      if (roomInfo && player && roomInfo.gameStateInstance.acquireToken(tokenStoreId, roomInfo.gameName, roomId, player.id, tokenId)) {
        const store = roomInfo.gameStateInstance.getTokenStore(tokenStoreId);
        if (store) io.to(roomId).emit(`token-store:update:${roomId}:${tokenStoreId}`, store.getTokens());
        emitPlayerUpdate(roomId);
      }
    });

    // ドラッグ可能オブジェクト関連
    socket.on('draggable:moved', (data) => {
      const { roomId, ...move } = data;
      socket.to(roomId).emit('draggable:update', move);
    });

    // カーソル関連
    socket.on('cursor:move', (data) => {
      const { roomId, x, y } = data;
      const playerId = socket.id;

      socket.to(roomId).emit('cursor:update', {
        playerId,
        x,
        y,
      });
    });

    // タイマー
    socket.on('timer:start', ({ duration, roomId }: { duration: number; roomId: RoomId }) => {
      const roomInfo = activeRooms.get(roomId);
      if (!roomInfo) return;
      stopTimer(roomId, roomInfo.gameName);
      let rem = duration;
      io.to(roomId).emit('timer:start', { duration, roomId });
      const tick = () => {
        if (rem <= 0) {
          stopTimer(roomId, roomInfo.gameName);
          io.to(roomId).emit('timer:finish', { roomId });
          return;
        }
        io.to(roomId).emit('timer:update', { remaining: rem, roomId });
        rem--;
        roomTimers.set(roomId, setTimeout(tick, 1000));
      };
      tick();
    });

    // 次のターン
    socket.on('game:next-turn', ({ roomId }: { roomId: RoomId }) => {
      const roomInfo = activeRooms.get(roomId);
      if (!roomInfo) return;

      const { gameStateInstance } = roomInfo;
      if (gameStateInstance.players.length === 0) return;

      if (typeof roomInfo.checkGameEnd === 'function' && roomInfo.checkGameEnd(roomInfo)) {
        const results = typeof roomInfo.onGameEnd === 'function' ? roomInfo.onGameEnd(roomInfo) : { message: 'Game Over' };
        io.to(roomId).emit('game:end', results);
        return;
      }

      const nextIndex = (roomInfo.currentTurnIndex + 1) % gameStateInstance.players.length;
      if (nextIndex === 0) roomInfo.currentRoundIndex += 1;
      roomInfo.currentTurnIndex = nextIndex;

      const currentPlayer = gameStateInstance.players[roomInfo.currentTurnIndex];
      io.to(roomId).emit('game:turn', {
        playerId: currentPlayer?.id,
        currentRound: roomInfo.currentRoundIndex,
        currentTurnIndex: roomInfo.currentTurnIndex,
      });
    });

    // 切断処理
    socket.on('disconnect', async () => {
      let disconnectedroomId: RoomId | null = null;
      for (const [id, info] of activeRooms.entries()) {
        const idx = info.gameStateInstance.players.findIndex((p) => p.socketId === socket.id);
        if (idx !== -1) {
          disconnectedroomId = id;
          info.gameStateInstance.players.splice(idx, 1);
          break;
        }
      }
      if (disconnectedroomId) {
        const sockets = await io.in(disconnectedroomId).fetchSockets();
        if (sockets.length === 0) {
          activeRooms.delete(disconnectedroomId);
          io.emit('lobby:room-update');
        } else {
          emitPlayerUpdate(disconnectedroomId);
        }
      }
    });

    // カスタムイベント
    const customEvents = options.customEvents ? options.customEvents() : {};
    for (const [event, handler] of Object.entries(customEvents)) {
      socket.on(event, (data) => (handler as Function)(socket, data));
    }
  });
}
