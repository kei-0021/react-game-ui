// src/server/server-utils.ts
import { GameId, PlayerId, RoomId } from '@/types/definition.js';
import { Position } from '@/types/position.js';
import { RoomState } from '@/types/server.js';
import { TokenStore } from '@/types/tokenStore.js';

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
 * @param gamePresetId - 対象のゲームプリセットID
 * @param roomId - 対象のルームID
 * @param firstArg - ログのメイン内容（1つ以上の引数が必須）
 * @param args - 追加のログ情報
 */
export function server_log(
  tag: LogCategory,
  gamePresetId: GameId,
  roomId: RoomId,
  firstArg: any,
  ...args: any[]
): void {
  if (!LOG_CATEGORIES[tag]) {
    throw new Error(`不正なログカテゴリで呼び出されました: ${tag}`);
  }

  const fullArgs = [firstArg, ...args];

  if (tag === 'warn') {
    const header = `[${tag}] [${gamePresetId} (${roomId})]`;
    console.warn(ANSI_RED + header + ANSI_RESET, ...fullArgs.map((arg) => ANSI_RED + String(arg) + ANSI_RESET));
  } else {
    console.log(`[${tag}] [${gamePresetId} (${roomId})]`, ...fullArgs);
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

export const applyCellEffect = (
  roomState: RoomState,
  gameId: GameId,
  roomId: RoomId,
  playerId: PlayerId,
  position: Position,
  cellEffects: Record<string, (params: any) => void>,
  addScore: (playerId: PlayerId, points: number) => void,
  updatePlayerResource: (playerId: PlayerId, resourceId: string, amount: number) => void,
  updatePlayerToken: (playerId: PlayerId, tokenId: string, amount: number) => void,
  requirePopup: (params: any) => void,
): void => {
  const { row, col } = position;

  // Record（オブジェクト）の最初の値（ボード配列）を取得
  const targetBoard = Object.values(roomState.board)[0];

  // ボードが存在しない、または座標が範囲外の場合のガード
  if (!targetBoard || row < 0 || row >= targetBoard.length || col < 0 || col >= targetBoard[row].length) {
    server_log('warn', gameId, roomId, `applyCellEffect: 不正な座標 (${row}, ${col}) またはボードがありません。`);
    return;
  }

  // 特定したボードからセルを取得
  const cell = targetBoard[row][col];
  const effect = cellEffects[cell.name];

  if (effect) {
    server_log('cell', gameId, roomId, `マス効果発動: ${cell.name} by ${playerId}`);
    try {
      effect({
        playerId,
        addScore,
        updateResource: updatePlayerResource,
        updateToken: updatePlayerToken,
        requirePopup: requirePopup,
      });
    } catch (e) {
      server_log('warn', gameId, roomId, `マス効果の実行中にエラーが発生しました: ${cell.name}`, e);
    }
  } else {
    server_log('cell', gameId, roomId, `マス効果なし: (${row}, ${col}) ${cell.name}`);
  }
};

export class RoomManager {
  constructor(
    private state: RoomState,
    private gameId: GameId,
    private roomId: RoomId,
  ) {}

  getTokenStore(tokenStoreId: string): TokenStore | undefined {
    return this.state.tokenStores?.get(tokenStoreId);
  }

  acquireToken(
    roomState: RoomState,
    tokenStoreId: string,
    gameId: GameId,
    roomId: RoomId,
    playerId: PlayerId,
    tokenId: string,
  ): boolean {
    const player = roomState.players.find((p) => p.id === playerId);
    if (!player) return false;
    if (tokenStoreId === 'scoreboard-acquisition') {
      server_log(
        'token',
        gameId,
        roomId,
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
        gameId,
        roomId,
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
          gameId,
          roomId,
          `ユーザー ${playerId} がストア ${tokenStoreId} からトークン ${tokenId} を獲得しました。`,
        );
        return true;
      }
    }
    return false;
  }
}

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
