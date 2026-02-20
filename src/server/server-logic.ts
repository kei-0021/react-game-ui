import { Server, Socket } from 'socket.io';
import {
  applyCellEffect,
  createRandomBoard,
  GameSettings,
  GameState,
  generateColorFromId,
  markCellAsExplored,
  RoomGameInfo,
  server_log,
  unmarkCellAsExplored,
} from './server-utils.js';

import { DeckId, PlayerId, ResourceId, RoomId, TokenId } from '@/types/definition.js';
import type { Card } from '../types/card.js';
import type { Deck } from '../types/deck.js';
import type { GameServerOptions } from './server.js';

const activeRooms = new Map<string, RoomGameInfo>();
const roomTimers = new Map<string, NodeJS.Timeout>();

// --- ルームメタ情報取得 ---
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

// --- ルーム初期化 ---
function initializeRoom(roomId: RoomId, settings: GameSettings): RoomGameInfo {
  const initialDecks = settings.initialDecks || [];
  const initialResources = settings.initialResources || [];
  const initialTokenStores = Array.isArray(settings.initialTokenStore) ? settings.initialTokenStore : [];
  const initialTokens = settings.initialTokens || [];
  const initialBoard = settings.initialBoard || [];

  const Cells = createRandomBoard(initialBoard);

  const initialState = {
    players: [],
    initialResources,
    initialTokenStores,
    initialTokens,
    board: Cells,
    exploredCells: [],
    turn: 1,
  };

  const gameStateInstance = new GameState(initialState as any, initialTokenStores);

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
      coordinate: { x: 50, y: 50 },
    }));
    decks[deck.deckId] = cards;
    drawnCards[deck.deckId] = [];
    playFieldCards[deck.deckId] = [];
    discardPile[deck.deckId] = [];
    server_log('deck', settings.name || 'Standard', roomId, `デッキ "${deck.deckId}" 初期化完了`);
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

export function initGameServer(io: Server, options: GameServerOptions = {}) {
  const gamePresets = options.gamePresets || {};
  const cellEffects = options.cellEffects || {};

  // --- ヘルパー関数 ---
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

  const addScore = (roomId: RoomId, playerId: PlayerId, points: number) => {
    const roomInfo = activeRooms.get(roomId);
    const player = roomInfo?.gameStateInstance.players.find((p) => p.id === playerId);
    if (player) {
      player.score = (player.score || 0) + points;
      server_log('addScore', roomInfo!.gameName, roomId, `${player.name} に ${points}pt 加算`);
      emitPlayerUpdate(roomId);
    }
  };

  const updatePlayerResource = (roomId: RoomId, playerId: PlayerId, resourceId: ResourceId, amount: number) => {
    const roomInfo = activeRooms.get(roomId);
    const player = roomInfo?.gameStateInstance.players.find((p) => p.id === playerId);
    const resource = player?.resources?.find((r) => r.id === resourceId);
    if (resource) {
      resource.currentValue = Math.min(resource.maxValue, Math.max(0, resource.currentValue + amount));
      server_log('resource', roomInfo!.gameName, roomId, `${player!.name}: ${resource.name} 更新`);
      emitPlayerUpdate(roomId);
      return true;
    }
    return false;
  };

  const updatePlayerToken = (roomId: RoomId, playerId: PlayerId, tokenId: TokenId, amount: number) => {
    const roomInfo = activeRooms.get(roomId);
    const player = roomInfo?.gameStateInstance.players.find((p) => p.id === playerId);
    const token = player?.tokens?.find((t) => t.id === tokenId);
    if (token) {
      token.count = Math.max(0, (token.count || 0) + amount);
      server_log('token', roomInfo!.gameName, roomId, `${player!.name}: ${tokenId} 更新`);
      emitPlayerUpdate(roomId);
      return true;
    }
    return false;
  };

  const stopTimer = (roomId: RoomId, gameName: string) => {
    const timer = roomTimers.get(roomId);
    if (timer) {
      clearTimeout(timer);
      roomTimers.delete(roomId);
      server_log('timer', gameName, roomId, `タイマー停止`);
    }
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

  io.on('connection', (socket: Socket) => {
    // ロビー
    socket.on('lobby:get-rooms', () => {
      const roomList = Array.from(activeRooms.keys()).map(getRoomMeta).filter(Boolean);
      socket.emit('lobby:rooms-list', roomList);
    });

    // 参加
    socket.on('room:join', async ({ roomId, playerName, gamePresetId }) => {
      if (!roomId) return;
      let roomInfo = activeRooms.get(roomId);
      const roomSettings = gamePresets[gamePresetId] || options;

      if (!roomInfo) {
        roomInfo = initializeRoom(roomId, { ...roomSettings, name: gamePresetId });
        Object.keys(roomInfo.decks).forEach((id) => shuffleDeck(roomId, id));
        io.emit('lobby:room-update');
      }

      await socket.join(roomId);
      const { gameStateInstance, decks } = roomInfo;
      let player = gameStateInstance.players.find((p) => p.socketId === socket.id);

      if (!player) {
        player = {
          id: `${roomId}_p${gameStateInstance.players.length + 1}`,
          name: playerName?.trim() || `Player ${gameStateInstance.players.length + 1}`,
          color: generateColorFromId(`${roomId}_p${gameStateInstance.players.length + 1}`),
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
      if (gameStateInstance.exploredCells.length > 0) socket.emit('board-update', gameStateInstance.exploredCells);
    });

    // 移動・探索
    socket.on('game:move-player', ({ roomId, playerId, newPosition }) => {
      const roomInfo = activeRooms.get(roomId);
      const player = roomInfo?.gameStateInstance.players.find((p) => p.id === playerId);
      if (player && roomInfo) {
        player.position = newPosition;
        const updated = markCellAsExplored(roomInfo.gameStateInstance, roomInfo.gameName, roomId, newPosition);
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
          ({ message, color }) => io.to(roomId).emit('client:show-popup', { message, color, timestamp: Date.now() }),
        );
        emitPlayerUpdate(roomId);
        if (updated) io.to(roomId).emit('board-update', roomInfo.gameStateInstance.exploredCells);
      }
    });

    socket.on('game:explore-cell', ({ roomId, targetPosition }) => {
      const roomInfo = activeRooms.get(roomId);
      if (roomInfo && markCellAsExplored(roomInfo.gameStateInstance, roomInfo.gameName, roomId, targetPosition)) {
        io.to(roomId).emit('board-update', roomInfo.gameStateInstance.exploredCells);
      }
    });

    socket.on('game:unexplore-cell', ({ roomId, targetPosition }) => {
      const roomInfo = activeRooms.get(roomId);
      if (roomInfo && unmarkCellAsExplored(roomInfo.gameStateInstance, roomInfo.gameName, roomId, targetPosition)) {
        io.to(roomId).emit('board-update', roomInfo.gameStateInstance.exploredCells);
      }
    });

    // デッキ操作
    socket.on('deck:draw', ({ roomId, deckId, playerId, drawLocation = 'hand' }) => {
      const roomInfo = activeRooms.get(roomId);
      if (!roomInfo || !roomInfo.decks[deckId]) return;
      const deck = roomInfo.decks[deckId].filter((c) => c.location === 'deck');
      if (deck.length === 0) return;

      const card = deck[0];
      if (drawLocation === 'discard') {
        card.location = 'discard';
        roomInfo.discardPile[deckId].push(card);
      } else if (playerId) {
        const p = roomInfo.gameStateInstance.players.find((p) => p.id === playerId);
        if (p) {
          card.location = drawLocation as any;
          card.ownerId = playerId;
          p.cards.push(card);
        }
      } else {
        card.location = 'field';
        roomInfo.playFieldCards[deckId].push(card);
      }
      server_log('deck', roomInfo.gameName, roomId, `DRAW: ${card.name}`);
      emitDeckUpdate(roomId, deckId);
    });

    socket.on('deck:reset', ({ roomId, deckId }) => {
      const roomInfo = activeRooms.get(roomId);
      if (!roomInfo) return;
      roomInfo.decks[deckId].forEach((c) => {
        if (c.location === 'discard') {
          c.location = 'deck';
          c.isFaceUp = false;
          c.ownerId = null;
        }
      });
      roomInfo.discardPile[deckId] = [];
      shuffleDeck(roomId, deckId);
      emitDeckUpdate(roomId, deckId);
    });

    // カード位置同期 (不具合修正版)
    socket.on('card:move-on-field', ({ roomId, deckId, cardId, coordinate }) => {
      const roomInfo = activeRooms.get(roomId);
      const card = roomInfo?.decks[deckId]?.find((c) => c.id === cardId);
      if (card) {
        card.coordinate = coordinate;
        emitDeckUpdate(roomId, deckId);
      }
    });

    socket.on('card:play', ({ roomId, deckId, cardIds, playerId, playLocation = 'field', coordinate }) => {
      const roomInfo = activeRooms.get(roomId);
      if (!roomInfo) return;

      const ids = Array.isArray(cardIds) ? cardIds : [cardIds];

      ids.forEach((id) => {
        const card = roomInfo.decks[deckId]?.find((c) => c.id === id);
        if (!card) return;

        if (playerId) {
          const p = roomInfo.gameStateInstance.players.find((p) => p.id === playerId);
          if (p) p.cards = p.cards.filter((c) => c.id !== id);
        }

        card.location = playLocation as any;
        if (coordinate?.x != null && coordinate?.y != null) {
          card.coordinate = coordinate;
          server_log('card', roomInfo.gameName, roomId, `Update Coord: x=${coordinate.x}, y=${coordinate.y}`);
        }
        card.isFaceUp = true;

        roomInfo.playFieldCards[deckId] = roomInfo.playFieldCards[deckId].filter((c) => c.id !== id);
        roomInfo.discardPile[deckId] = roomInfo.discardPile[deckId].filter((c) => c.id !== id);

        if (playLocation === 'discard') {
          roomInfo.discardPile[deckId].push(card);
        } else {
          roomInfo.playFieldCards[deckId].push(card);
        }
      });

      emitDeckUpdate(roomId, deckId);
    });

    // ドラッグ中も監視
    socket.on('card:move-on-field', ({ roomId, deckId, cardId, coordinate }) => {
      const roomInfo = activeRooms.get(roomId);
      const card = roomInfo?.decks[deckId]?.find((c) => c.id === cardId);
      if (card && coordinate) {
        card.coordinate = coordinate;
        emitDeckUpdate(roomId, deckId);
      }
    });

    socket.on('card:reveal', ({ roomId, playerId, cardIds }) => {
      const roomInfo = activeRooms.get(roomId);
      const p = roomInfo?.gameStateInstance.players.find((p) => p.id === playerId);
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
      const roomInfo = activeRooms.get(roomId);
      const player = roomInfo?.gameStateInstance.players.find((p) => p.socketId === socket.id);
      if (
        roomInfo &&
        player &&
        roomInfo.gameStateInstance.acquireToken(tokenStoreId, roomInfo.gameName, roomId, player.id, tokenId)
      ) {
        const store = roomInfo.gameStateInstance.getTokenStore(tokenStoreId);
        if (store) io.to(roomId).emit(`token-store:update:${roomId}:${tokenStoreId}`, store.getTokens());
        emitPlayerUpdate(roomId);
      }
    });

    socket.on('dice:roll', ({ roomId, diceId, sides }) => {
      const roomInfo = activeRooms.get(roomId);
      if (roomInfo) {
        const val = Math.floor(Math.random() * sides) + 1;
        io.to(roomId).emit(`dice:rolled:${roomId}:${diceId}`, val);
      }
    });

    // タイマー・その他同期
    socket.on('timer:start', ({ duration, roomId }) => {
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

    socket.on('cursor:move', ({ roomId, x, y }) => {
      socket.to(roomId).emit('cursor:update', { playerId: socket.id, x, y });
    });

    socket.on('draggable:moved', (data) => {
      const { roomId, ...move } = data;
      socket.to(roomId).emit('draggable:update', move);
    });

    socket.on('game:next-turn', ({ roomId }) => {
      const roomInfo = activeRooms.get(roomId);
      if (roomInfo && roomInfo.gameStateInstance.players.length > 0) {
        const nextIdx = (roomInfo.currentTurnIndex + 1) % roomInfo.gameStateInstance.players.length;
        if (nextIdx === 0) roomInfo.currentRoundIndex++;
        roomInfo.currentTurnIndex = nextIdx;
        const curr = roomInfo.gameStateInstance.players[nextIdx];
        io.to(roomId).emit('game:turn', {
          playerId: curr.id,
          currentRound: roomInfo.currentRoundIndex,
          currentTurnIndex: nextIdx,
        });
      }
    });

    // --- カスタムイベント (ここを復元しました) ---
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
      for (const [id, info] of activeRooms.entries()) {
        const idx = info.gameStateInstance.players.findIndex((p) => p.socketId === socket.id);
        if (idx !== -1) {
          info.gameStateInstance.players.splice(idx, 1);
          if (info.gameStateInstance.players.length === 0) {
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
