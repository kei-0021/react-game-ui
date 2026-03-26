// src/server/server.ts
import { CellData } from '@/index.js';
import { BoardId, CardId, DeckId, DraggableId, PlayerId, RoomId, TokenStoreId } from '@/types/definition.js';
import { DraggableData } from '@/types/draggable.js';
import { GameParam, RoomState } from '@/types/server.js';
import {
  BaordMovePlayerData,
  BoardMovableRangeData,
  BoardUpdateData,
  CardFlipData,
  CardHoldData,
  CardMoveFromFieldData,
  CardMoveOnFieldData,
  CardPlayData,
  DeckDrawData,
  DiceRollData,
  DiceUpdateData,
  DraggableMovedData,
  GameComponentData,
  GameCreateData,
  GameDeleteData,
  GameMeta,
  GameNextRoundData,
  GameNextTrunData,
  GameParamUpdateData,
  GameTurnUpdateData,
  LobbyGameList,
  LobbyRoomList,
  ObjectBringToData,
  RoomJoinData,
  RoomMeta,
  TokenAcquireData,
} from '@/types/socketData.js';
import { Token } from '@/types/token.js';
import { TokenStore } from '@/types/tokenStore.js';
import { exec } from 'child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { Server, Socket } from 'socket.io';
import util from 'util';
import type { Card } from '../types/card.js';
import type { Deck } from '../types/deck.js';
import { generateColorFromId, LOG_CATEGORIES, RoomManager } from './server-utils.js';
import type { GameServerOptions } from './server.js';

const activeRooms = new Map<string, RoomState>();
const execPromise = util.promisify(exec);

/**
 * 新しいゲームルームの状態を初期化し、実行中のルーム管理（activeRooms）に追加する。
 * @param roomId - ルームID
 * @param param - ゲーム開始時に必要な初期パラメータ
 * @returns 初期化が完了した {@link RoomState} オブジェクト
 */
function initializeRoom(roomId: RoomId, param: GameParam): RoomState {
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
    if (cards.length > 0) {
      RoomManager.server_log('deck', param.gameId, roomId, `サンプル (0番目): ${JSON.stringify(cards[0], null, 2)}`);
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
  if (param.draggable) {
    draggables = structuredClone(param.draggable);

    RoomManager.server_log('draggable', param.gameId, roomId, `ドラッグ可能オブジェクトを初期化完了`);
    RoomManager.server_log(
      'draggable',
      param.gameId,
      roomId,
      `サンプル (0番目): ${JSON.stringify(Object.values(draggables)[0], null, 2)}`,
    );
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
    draggable: draggables,
    timer: {} as NodeJS.Timeout,
    maxZIndex: initialMaxZIndex,
    systemMessageHistory: [],
  };

  activeRooms.set(roomId, state);
  RoomManager.server_log('room', state.gameId, roomId, `ルーム初期化完了`);
  return state;
}

export function initGameServer(io: Server, options: GameServerOptions) {
  const gameParams = options.gameParams || {};

  if (options.initialLogCategories) {
    Object.assign(LOG_CATEGORIES, options.initialLogCategories);

    const green = '\x1b[32m';
    const red = '\x1b[31m';
    const reset = '\x1b[0m';

    console.log(`[log] ログカテゴリをオプションで初期化しました。`);

    Object.entries(LOG_CATEGORIES).forEach(([key, value]) => {
      const color = value ? green : red;
      console.log(`${key}: ${color}${value}${reset}`);
    });
  }

  io.on('connection', (socket: Socket) => {
    // GUIからConfigファイルを直接書き換える
    socket.on('game-param:update', async (data: GameParamUpdateData) => {
      try {
        // ベースとなるルートディレクトリを確定させる
        const root = process.cwd();

        // src が存在するかチェックして、書き込み先ディレクトリを決定する
        const getTargetDir = () => {
          const srcPath = path.join(root, 'src', 'server');
          const testsPath = path.join(root, 'tests', 'server');

          // tests/server が存在すればそこを優先
          return fs.existsSync(testsPath) ? testsPath : srcPath;
        };

        const targetDir = getTargetDir();
        const targetPath = path.join(targetDir, `${data.gameId}Data.ts`);

        // 現在のメモリ上の設定を取得
        const currentParam = gameParams[data.gameId] || {};

        // 届いた newParam で既存の設定をマージ
        const mergedParam = {
          ...currentParam,
          ...data.newParam,
        };

        console.log('新しく届いたデータ:', data.newParam);

        delete mergedParam.cardEffects;
        delete mergedParam.cellEffects;
        delete mergedParam.shuffleAndReconnectBoard;
        delete mergedParam.initialBoard;
        // delete mergedParam.components;

        const setupContent = JSON.stringify(mergedParam, null, 2);

        const pascalName = data.gameId.charAt(0).toUpperCase() + data.gameId.slice(1);
        const content = `export const ${pascalName}Data: any = ${setupContent};`;

        await fs.promises.writeFile(targetPath, content, 'utf8');
        console.log(`[Admin] ${pascalName}Data.ts を更新`);
        socket.emit('game-param:updated', { success: true });
      } catch (err) {
        console.error('[Admin] 書き換え失敗:', err);
        socket.emit('error', 'ファイルの保存に失敗');
      }
    });

    socket.on('game:create', async (data: GameCreateData) => {
      try {
        const { gameName, gameIcon } = data;

        // プロジェクトルートにある CLI を実行
        const cliPath = path.resolve(process.cwd(), 'src/cli/generate-new-game.ts');
        const command = `npx tsx ${cliPath} ${gameName} ${gameIcon}`;

        console.log(`[Admin] CLI実行中: ${command}`);

        const { stdout, stderr } = await execPromise(command);

        if (stderr) {
          console.warn(`[Admin] CLI警告: ${stderr}`);
        }

        console.log(`[Admin] CLI完了: ${stdout}`);

        socket.emit('game:created', {
          success: true,
          gameId: gameName.toLowerCase(),
        });
      } catch (err: any) {
        console.error(`[Admin] CLIエラー: ${err.message}`);
        socket.emit('error', 'ゲーム生成に失敗しました');
      }
    });

    socket.on('game:delete', async (data: GameDeleteData) => {
      try {
        const { gameId } = data;

        const cliPath = path.resolve(process.cwd(), 'src/cli/delete-game.ts');
        const command = `npx tsx ${cliPath} ${gameId}`;

        console.log(`[Admin] 削除CLI実行中: ${command}`);

        const { stdout, stderr } = await execPromise(command);

        if (stderr) {
          console.warn(`[Admin] 削除CLI警告: ${stderr}`);
        }

        console.log(`[Admin] 削除CLI完了: ${stdout}`);

        // フロントに完了を通知
        socket.emit('game:deleted', {
          success: true,
          gameId: gameId,
        });
      } catch (err: any) {
        console.error(`[Admin] 削除CLIエラー: ${err.message}`);
        socket.emit('error', 'ゲームの削除に失敗しました');
      }
    });

    // ロビー
    socket.on('lobby:get-info', () => {
      const gameList: GameMeta[] = Object.keys(gameParams).map((id) => ({
        gameId: id,
        gameIcon: gameParams[id].gameIcon,
        maxPlayers: gameParams[id].maxPlayers,
        initialHand: gameParams[id].initialHand,
        initialTokens: gameParams[id].initialTokens,
      }));

      const roomList: RoomMeta[] = [];
      for (const [id, state] of activeRooms) {
        roomList.push({
          id,
          gameId: state.gameId,
          playerCount: state.players.length,
          maxPlayers: gameParams[state.gameId].maxPlayers,
          createdAt: state.createdAt,
        });
      }

      // 現在稼働中のルームとゲーム一覧を合わせて送る
      socket.emit('lobby:game-list', {
        games: gameList,
      } as LobbyGameList);
      socket.emit('lobby:room-list', {
        rooms: roomList,
      } as LobbyRoomList);
    });

    // ルーム参加
    socket.on('room:join', async ({ roomId, playerName, gameId }: RoomJoinData) => {
      if (!roomId) return;
      let state = activeRooms.get(roomId);
      const param = gameParams[gameId] || options;

      // 初回は状態の初期化を行う
      if (!state) {
        state = initializeRoom(roomId, { ...param, gameId: gameId });
        const roomManager = new RoomManager(io, param, state);
        Object.keys(state.decks).forEach((deckId) => roomManager.shuffleDeck(deckId));
        io.emit('room-ready');
      }

      const roomManager = new RoomManager(io, param, state);
      await socket.join(roomId);
      let player = state.players.find((p) => p.socketId === socket.id);

      // プレイヤークラスの初期化
      if (!player) {
        const playerId = `${roomId}_p${state.players.length + 1}`;
        player = {
          id: playerId,
          name: playerName?.trim() || `Player ${state.players.length + 1}`,
          color: generateColorFromId(playerId),
          socketId: socket.id,
          cards: [],
          isHolding: false,
          score: 0,
          resources: JSON.parse(JSON.stringify(param.initialResources || [])),
          tokens: [],
          position: { row: 0, col: 0 },
          movableCells: [],
          pieceImage: param.pieceImage,
        };
        state.players.push(player);
        roomManager.server_log('room', `${player.name} (${player.id})が参加しました`);

        // 初期手札配布処理
        const initialHand = param.initialHand;
        if (initialHand) {
          // initialHand に含まれるすべてのデッキ（deckId）をループ
          for (const [deckId, count] of Object.entries(initialHand)) {
            const target = state.decks[deckId];

            if (!target) continue;

            for (let i = 0; i < count; i++) {
              const idx = target.findIndex((c) => c.location === 'deck');
              if (idx === -1) break;

              const card = target[idx];
              card.location = 'hand';
              card.ownerId = player.id;

              card.isFaceUp = card.drawCondition[1] === 'face';

              player.cards.push(card);
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
                player.tokens.push(masterToken);
              }
            }
          }
        }
      } else {
        player.socketId = socket.id;
      }
      // 各種コンポーネントの準備
      socket.emit('player:assign-id', player.id);

      // コンポーネント情報を伝える
      const data: GameComponentData = {
        state: state,
        components: param.components,
      };
      socket.emit('game:component', data);

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

      // プレイヤー, デッキ, トークン置き場, ボード, ドラッグ可能オブジェクト の初期状態を配信
      roomManager.emitPlayerUpdate();
      Object.keys(state.decks).forEach((id) => roomManager.emitDeckUpdate(id));
      Object.keys(state.tokenStores).forEach((id) => roomManager.emitTokenStoreUpdate(id));
      if (state.exploredCells.length > 0) socket.emit('cell:update', state.exploredCells);
      Object.entries(state.boards).forEach(([boardId, board]) => {
        socket.emit('board:update', { boardId, board } as BoardUpdateData);
      });
      Object.keys(state.draggable).forEach((id) => roomManager.emitDraggableUpdate(id));

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

    // カードを引く
    socket.on('deck:draw', (data: DeckDrawData) => {
      const { roomId, deckId, playerId, drawCondition } = data;
      const state = activeRooms.get(roomId);

      if (!state || playerId === null) return;
      const param = gameParams[state.gameId];
      const roomManager = new RoomManager(io, param, state);

      if (playerId && state.holdCards[playerId]) {
        roomManager.server_log('card', `${playerId} はカードをホールドしているので、カードを引くことができません`);
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

      roomManager.shuffleDeck(deckId);
      roomManager.emitDeckUpdate(deckId);
    });

    socket.on('deck:reset', ({ roomId, deckId }) => {
      const state = activeRooms.get(roomId);
      if (!state) return;
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
    socket.on('card:flip', ({ roomId, playerId, cardIds }: CardFlipData) => {
      const state = activeRooms.get(roomId);
      if (!state) return;
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
    socket.on('card:move-on-field', ({ roomId, deckId, cardId, coordinate, zIndex }: CardMoveOnFieldData) => {
      const state = activeRooms.get(roomId);
      if (!state) return;
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
    socket.on('card:move-from-field', (data: CardMoveFromFieldData) => {
      const { roomId, deckId, cardId, playerId } = data;
      const state = activeRooms.get(roomId);
      if (!state || !playerId) return;
      const param = gameParams[state.gameId];

      const roomManager = new RoomManager(io, param, state);

      if (state.holdCards[playerId]) {
        roomManager.server_log('card', `${playerId} はカードをホールドしているので、カードを移動できません`);
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

    // 駒の移動
    socket.on('board:move-player', ({ roomId, boardId, playerId, newLocation }: BaordMovePlayerData) => {
      const state = activeRooms.get(roomId);
      if (!state) return;
      const param = gameParams[state.gameId];
      const roomManager = new RoomManager(io, param, state);

      const player = state?.players.find((p) => p.id === playerId);
      if (player && state) {
        player.position = newLocation;

        // セル効果
        const cellEffects = param.cellEffects;
        if (cellEffects) {
          roomManager.applyCellEffect(boardId, playerId, newLocation, cellEffects);
        }

        // カスタムフック
        const onPieceMove = param.onPieceMove;
        if (onPieceMove) {
          onPieceMove(state, roomManager, newLocation);
        }

        roomManager.emitPlayerUpdate();
      }
    });

    // プレイヤーの移動可能範囲リクエストを処理する
    socket.on('board:movable-range', ({ roomId, boardId, playerId, moveRange, isExact }: BoardMovableRangeData) => {
      const state = activeRooms.get(roomId);
      if (!state) return;
      const param = gameParams[state.gameId];
      const roomManager = new RoomManager(io, param, state);

      // プレイヤーの現在位置を取得
      const player = state.players.find((p) => p.id === playerId);
      if (!player) return;

      const { row, col } = player.position;
      const startCellId = `r${row}c${col}`;

      // 移動範囲を計算
      const movableIds = roomManager.getMovableCellIds(boardId, startCellId, moveRange, isExact);

      // セルIDをクライアントが解釈できる GridLocation[] 形式に変換
      const movableLocs = movableIds.map((id) => {
        const m = id.match(/r(\d+)c(\d+)/);
        return {
          row: parseInt(m![1], 10),
          col: parseInt(m![2], 10),
        };
      });
      player.movableCells = movableLocs;

      roomManager.emitPlayerUpdate();
    });

    // ダイス
    socket.on('dice:roll', ({ roomId, diceId, sides }: DiceRollData) => {
      const state = activeRooms.get(roomId);
      if (!state) return;
      const param = gameParams[state.gameId];
      const roomManager = new RoomManager(io, param, state);

      const data: DiceUpdateData = {
        value: Math.floor(Math.random() * sides) + 1,
      };
      roomManager.server_log('dice', `Dice ${diceId} rolled. Result: ${data.value}`);
      io.to(roomId).emit(`dice:update:${diceId}`, data);
    });

    // タイマー・その他同期
    socket.on('timer:start', ({ duration, roomId }) => {
      const state = activeRooms.get(roomId);
      if (!state) return;
      const param = gameParams[state.gameId];
      const roomManager = new RoomManager(io, param, state);

      roomManager.stopTimer();
      let rem = duration;
      io.to(roomId).emit('timer:start', { duration, roomId });
      const tick = () => {
        if (rem <= 0) {
          roomManager.stopTimer();
          io.to(roomId).emit('timer:finish', { roomId });
          return;
        }
        io.to(roomId).emit('timer:update', { remaining: rem, roomId });
        rem--;
        state.timer = setTimeout(tick, 1000);
      };
      tick();
    });

    socket.on('cursor:move', ({ roomId, x, y }) => {
      socket.to(roomId).emit('cursor:update', { playerId: socket.id, x, y });
    });

    socket.on('draggable:moved', ({ roomId, draggableId, coordinate, rotation }: DraggableMovedData) => {
      const state = activeRooms.get(roomId);
      if (!state) return;
      const param = gameParams[state.gameId];
      const roomManager = new RoomManager(io, param, state);

      const draggable = state.draggable[draggableId];
      draggable.coordinate = coordinate;
      draggable.rotation = rotation;

      roomManager.emitDraggableUpdate(draggableId);
    });

    // 重ね順更新
    socket.on('object:bring-to', ({ roomId, objectId, type, isFront }: ObjectBringToData) => {
      const state = activeRooms.get(roomId);
      if (!state) return;
      const param = gameParams[state.gameId];
      const roomManager = new RoomManager(io, param, state);

      roomManager.updateZIndex(type, objectId, isFront);
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
            io.emit('room-ready');
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
