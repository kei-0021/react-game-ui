import { GameId, RoomId } from '@/types/definition.js';
export type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';
export declare let CURRENT_LOG_LEVEL: LogLevel;
export declare const setLogLevel: (level: LogLevel) => void;
export type LogCategory = 'connection' | 'lobby' | 'game' | 'room' | 'deck' | 'card' | 'cell' | 'dice' | 'timer' | 'addScore' | 'resource' | 'token' | 'draggable' | 'warn' | 'popup' | 'custom_event' | 'disconnect';
export declare let LOG_CATEGORIES: Record<LogCategory, boolean>;
/**
 * サーバー全体のログを出力する共通関数
 * @param tag カテゴリ
 * @param gameId ゲームID (任意)
 * @param roomId ルームID (任意)
 * @param msg メッセージ内容
 * @param level ログレベル (デフォルト: INFO)
 */
export declare const server_log: (tag: LogCategory, gameId: GameId | null, roomId: RoomId | null, msg: string, level?: LogLevel) => void;
//# sourceMappingURL=logger.d.ts.map