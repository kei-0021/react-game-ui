// src/server/server-utils.ts
import { CardLocation } from '@/types/cardLocation.js';
import { CardState } from '@/types/cardState.js';
import { DeckId, GameId, PlayerId, RoomId, TokenId, TokenStoreId } from '@/types/definition.js';
import { Phase } from '@/types/phase.js';
import { Position } from '@/types/position.js';
import { RoomState } from '@/types/server.js';
import { DeckUpdateData, GamePhaseUpdateData } from '@/types/socketData.js';
import { TokenStore } from '@/types/tokenStore.js';
import { Server } from 'socket.io';

export type LogCategory =
  | 'connection'
  | 'deck'
  | 'card'
  | 'cell'
  | 'game'
  | 'dice'
  | 'timer'
  | 'addScore'
  | 'resource'
  | 'token'
  | 'room'
  | 'lobby'
  | 'disconnect'
  | 'warn'
  | 'popup'
  | 'custom_event';

export let LOG_CATEGORIES: Record<LogCategory, boolean> = {
  connection: true,
  deck: false,
  card: true,
  cell: true,
  game: true,
  dice: true,
  timer: false,
  addScore: true,
  resource: true,
  token: true,
  room: true,
  lobby: true,
  disconnect: true,
  warn: true,
  popup: true,
  custom_event: true,
};

const ANSI_RED = '\x1b[31m';
const ANSI_RESET = '\x1b[0m';

/**
 * サーバーの実行ログを出力する
 * @param tag - ログのカテゴリ
 * @param gameId - 対象のゲームプリセットID
 * @param roomId - 対象のルームID
 * @param firstArg - ログのメイン内容（1つ以上の引数が必須）
 * @param args - 追加のログ情報
 */
export function server_log(tag: LogCategory, gameId: GameId, roomId: RoomId, firstArg: any, ...args: any[]): void {
  if (!LOG_CATEGORIES[tag]) {
    throw new Error(`不正なログカテゴリで呼び出されました: ${tag}`);
  }

  const fullArgs = [firstArg, ...args];

  if (tag === 'warn') {
    const header = `[${tag}] [${gameId} (${roomId})]`;
    console.warn(ANSI_RED + header + ANSI_RESET, ...fullArgs.map((arg) => ANSI_RED + String(arg) + ANSI_RESET));
  } else {
    console.log(`[${tag}] [${gameId} (${roomId})]`, ...fullArgs);
  }
}

export const isExplored = (roomState: RoomState, position: Position): boolean => {
  return roomState.exploredCells.some((loc) => loc.row === position.row && loc.col === position.col);
};

export const markCellAsExplored = (
  roomState: RoomState,
  gameId: GameId,
  roomId: RoomId,
  position: Position,
): boolean => {
  if (!isExplored(roomState, position)) {
    roomState.exploredCells.push(position);
    server_log('cell', gameId, roomId, `マス (${position.row}, ${position.col}) を探索済みとしてマークしました。`);
    return true;
  }
  return false;
};

export const unmarkCellAsExplored = (
  roomState: RoomState,
  gameId: GameId,
  roomId: RoomId,
  position: Position,
): boolean => {
  const initialLength = roomState.exploredCells.length;
  roomState.exploredCells = roomState.exploredCells.filter(
    (loc) => !(loc.row === position.row && loc.col === position.col),
  );
  const wasRemoved = roomState.exploredCells.length < initialLength;
  if (wasRemoved) {
    server_log('cell', gameId, roomId, `マス (${position.row}, ${position.col}) の探索済みマークを解除しました。`);
  }
  return wasRemoved;
};

const shuffleArray = <T>(array: T[]): T[] => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

export const createRandomBoard = (initialBoard: any[][]): any[][] => {
  if (!initialBoard || initialBoard.length === 0 || initialBoard[0].length === 0) {
    return [];
  }
  const rows = initialBoard.length;
  const cols = initialBoard[0].length;
  let allCells: any[] = [];
  initialBoard.forEach((rowArr) => {
    allCells = allCells.concat(rowArr);
  });
  shuffleArray(allCells);
  const newBoard: any[][] = [];
  let cellIndex = 0;
  for (let r = 0; r < rows; r++) {
    const newRow: any[] = [];
    for (let c = 0; c < cols; c++) {
      if (cellIndex >= allCells.length) break;
      const originalCell = allCells[cellIndex];
      newRow.push({
        ...originalCell,
        id: `r${r}c${c}`,
      });
      cellIndex++;
    }
    if (newRow.length > 0) {
      newBoard.push(newRow);
    }
  }
  return newBoard;
};

export const generateColorFromId = (id: string): string => {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash << 5) - hash + id.charCodeAt(i);
    hash |= 0;
  }
  const goldenRatioConjugate = 0.618033988749895;
  let hue = (Math.abs(hash) * goldenRatioConjugate) % 1;
  const finalHue = Math.floor(hue * 360);
  return `hsl(${finalHue}, 70%, 50%)`;
};

/**
 * ゲームにおける状態（State）の変更と、それに伴うサーバーログ出力を一括管理する。
 */
export class RoomManager {
  constructor(
    private io: Server,
    private state: RoomState,
  ) {}

  /**
   * プレイヤー更新を更新する
   */
  emitPlayerUpdate = () => {
    this.io.to(this.state.roomId).emit('players:update', this.state.players);
  };

  /**
   * デッキ更新を通知する
   */
  emitDeckUpdate = (deckId: DeckId) => {
    const updateData: DeckUpdateData = {
      currentDeck: this.state.decks[deckId].filter((c) => c.location === 'deck'),
      drawnCards: this.state.drawnCards[deckId],
      playFieldCards: this.state.playFieldCards[deckId],
      discardPile: this.state.discardPile[deckId],
    };
    this.io.to(this.state.roomId).emit(`deck:update:${this.state.roomId}:${deckId}`, updateData);
  };

  /**
   * カードをデッキから引く（移動ロジックの外注先）
   */
  drawCard(deckId: DeckId, condition: [CardLocation, CardState], playerId?: PlayerId): boolean {
    const [targetLocation, targetState] = condition;

    // デッキから「deck」ロケーションにあるカードを抽出
    const currentDeck = this.state.decks[deckId].filter((c) => c.location === 'deck');
    if (!currentDeck.length) return false;

    const card = currentDeck[0];
    card.isFaceUp = targetState === 'face';

    let destination = '';

    server_log(
      'deck',
      this.state.gameId,
      this.state.roomId,
      `DRAW: ${card.name} (ID:${card.id}) (deck -> ${destination}, state: ${targetState})`,
    );

    // A. 捨て札へ
    if (targetLocation === 'discard') {
      card.location = 'discard';
      card.ownerId = null;
      this.state.discardPile[deckId].push(card);
      destination = 'discard';
    }
    // B. プレイヤーの手札へ
    else if (playerId && targetLocation === 'hand') {
      const player = this.state.players.find((p) => p.id === playerId);
      if (player) {
        card.location = 'hand';
        card.ownerId = playerId;
        player.cards.push(card);
        destination = playerId;
      }
    }
    // C. プレイフィールドへ
    else {
      card.location = 'field';
      card.ownerId = null;
      this.state.playFieldCards[deckId].push(card);
      destination = 'field';
    }

    this.emitDeckUpdate(deckId);
    this.emitPlayerUpdate();
    return true;
  }

  /**
   * スコアを加算する
   * @param playerId - 対象のプレイヤーのID
   * @param points - 加算するスコア
   */
  addScore(playerId: PlayerId, points: number) {
    const player = this.state.players.find((p) => p.id === playerId);
    if (!player) return;

    player.score = (player.score || 0) + points;

    server_log('addScore', this.state.gameId, this.state.roomId, `${player.name} に ${points}pt 加算`);
    this.emitPlayerUpdate();
  }

  /**
   * セル効果を発動する
   * @param playerId - 効果を発動させたプレイヤーのID
   * @param position - 発動対象となるマスの座標
   * @param cellEffects - 各セル名に対応する効果処理の定義集
   * @param updatePlayerResource - プレイヤーのリソース（資源）を更新するためのコールバック関数
   * @param updatePlayerToken - プレイヤーのトークン所持数を更新するためのコールバック関数
   * @param requirePopup - クライアント側でポップアップを表示させるための要求関数
   */
  applyCellEffect = (
    playerId: PlayerId,
    position: Position,
    cellEffects: Record<string, (params: any) => void>,
    updatePlayerResource: (playerId: PlayerId, resourceId: string, amount: number) => void,
    updatePlayerToken: (playerId: PlayerId, tokenId: string, amount: number) => void,
    requirePopup: (params: any) => void,
  ): void => {
    const { row, col } = position;

    // Record（オブジェクト）の最初の値（ボード配列）を取得
    const targetBoard = Object.values(this.state.board)[0];

    // ボードが存在しない、または座標が範囲外の場合のガード
    if (!targetBoard || row < 0 || row >= targetBoard.length || col < 0 || col >= targetBoard[row].length) {
      server_log(
        'warn',
        this.state.gameId,
        this.state.roomId,
        `applyCellEffect: 不正な座標 (${row}, ${col}) またはボードがありません。`,
      );
      return;
    }

    // 特定したボードからセルを取得
    const cell = targetBoard[row][col];
    const effect = cellEffects[cell.name];

    if (effect) {
      server_log('cell', this.state.gameId, this.state.roomId, `マス効果発動: ${cell.name} by ${playerId}`);
      try {
        effect({
          playerId,
          updateResource: updatePlayerResource,
          updateToken: updatePlayerToken,
          requirePopup: requirePopup,
        });
      } catch (e) {
        server_log(
          'warn',
          this.state.gameId,
          this.state.roomId,
          `マス効果の実行中にエラーが発生しました: ${cell.name}`,
          e,
        );
      }
    } else {
      server_log('cell', this.state.gameId, this.state.roomId, `マス効果なし: (${row}, ${col}) ${cell.name}`);
    }
  };

  /**
   * トークン置き場を取得する
   * @param tokenStoreId - トークン置き場ID
   */
  getTokenStore(tokenStoreId: TokenStoreId): TokenStore | undefined {
    return this.state.tokenStores ? this.state.tokenStores[tokenStoreId] : undefined;
  }

  /**
   * トークンを取得する
   * @param tokenStoreId - トークン置き場ID
   * @param tokenId - トークンID
   * @param playerId - プレイヤーID
   */
  acquireToken(tokenStoreId: TokenStoreId, tokenId: TokenId, playerId: PlayerId): boolean {
    const player = this.state.players.find((p) => p.id === playerId);
    if (!player) return false;
    if (tokenStoreId === 'scoreboard-acquisition') {
      server_log(
        'token',
        this.state.gameId,
        this.state.roomId,
        `ユーザー ${playerId} が ScoreBoard 上でトークン ${tokenId} を操作しました。`,
      );
      if (!Array.isArray(player.tokens)) {
        player.tokens = [];
      }
      const token = {
        id: tokenId,
        name: `Token ${tokenId.slice(0, 4)}`,
        backColor: '#333',
        count: 1,
        imageSrc: '',
      };
      player.tokens.push(token);
      server_log(
        'token',
        this.state.gameId,
        this.state.roomId,
        `トークン ${tokenId} をプレイヤー ${playerId} のインベントリに再追加しました。`,
      );
      return true;
    }
    const store = this.getTokenStore(tokenStoreId);
    if (store) {
      const index = store.tokens.findIndex((t) => t.id === tokenId);
      if (index !== -1) {
        const acquiredToken = store.tokens.splice(index, 1)[0];
        if (!Array.isArray(player.tokens)) {
          player.tokens = [];
        }
        player.tokens.push(acquiredToken);
        server_log(
          'token',
          this.state.gameId,
          this.state.roomId,
          `ユーザー ${playerId} がストア ${tokenStoreId} からトークン ${tokenId} を獲得しました。`,
        );
        return true;
      }
    }
    return false;
  }

  /**
   * フェーズを更新する
   * @param newPhase - 新しいフェーズ
   */
  updatePhase(newPhase: Phase): void {
    if (this.state.currentPhase !== newPhase) {
      this.state.currentPhase = newPhase;
      server_log('game', this.state.gameId, this.state.roomId, `フェーズを更新しました: ${newPhase}`);
      this.io.to(this.state.roomId).emit('game:phase:update', {
        newPhase: this.state.currentPhase,
      } as GamePhaseUpdateData);
    }
  }
}
