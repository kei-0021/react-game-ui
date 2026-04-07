// src/server/logger.ts

import { GameId, RoomId } from '@/types/definition.js';

export type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
};

export let CURRENT_LOG_LEVEL: LogLevel = 'DEBUG';

export const setLogLevel = (level: LogLevel) => {
  CURRENT_LOG_LEVEL = level;
};

export type LogCategory =
  | 'connection'
  | 'lobby'
  | 'game'
  | 'room'
  | 'deck'
  | 'card'
  | 'cell'
  | 'dice'
  | 'timer'
  | 'addScore'
  | 'resource'
  | 'token'
  | 'draggable'
  | 'phase'
  | 'warn'
  | 'popup'
  | 'custom_event'
  | 'disconnect';

export let LOG_CATEGORIES: Record<LogCategory, boolean> = {
  connection: true,
  lobby: true,
  game: true,
  room: true,
  deck: true,
  card: true,
  cell: true,
  dice: true,
  timer: true,
  addScore: true,
  resource: true,
  token: true,
  draggable: true,
  phase: true,
  warn: true,
  popup: true,
  custom_event: true,
  disconnect: true,
};

/**
 * サーバー全体のログを出力する共通関数
 * @param tag カテゴリ
 * @param gameId ゲームID (任意)
 * @param roomId ルームID (任意)
 * @param msg メッセージ内容
 * @param level ログレベル (デフォルト: INFO)
 */
export const server_log = (
  tag: LogCategory,
  gameId: GameId | null,
  roomId: RoomId | null,
  msg: string,
  level: LogLevel = 'INFO',
): void => {
  if (!(tag in LOG_CATEGORIES)) {
    throw new Error(`未定義のログカテゴリです: ${tag}`);
  }

  if (LOG_LEVEL_PRIORITY[level] < LOG_LEVEL_PRIORITY[CURRENT_LOG_LEVEL]) {
    return;
  }

  if (!LOG_CATEGORIES[tag]) {
    return;
  }

  const time = new Intl.DateTimeFormat('ja-JP', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    timeZone: 'Asia/Tokyo',
  }).format(new Date());

  const gDisplay = gameId || 'SYSTEM';
  const rDisplay = roomId || 'GLOBAL';

  const header = `[${time}] [${level}] [${tag}] [${gDisplay} (${rDisplay})]`;
  const formattedLog = `${header} ${msg}`;

  switch (level) {
    case 'ERROR':
      console.error(formattedLog);
      break;
    case 'WARN':
      console.warn(formattedLog);
      break;
    default:
      console.log(formattedLog);
      break;
  }
};
