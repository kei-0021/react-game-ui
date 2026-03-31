export type LogCategory = 'connection' | 'lobby' | 'game' | 'room' | 'deck' | 'card' | 'cell' | 'dice' | 'timer' | 'addScore' | 'resource' | 'token' | 'draggable' | 'warn' | 'popup' | 'custom_event' | 'disconnect';
export declare let LOG_CATEGORIES: Record<LogCategory, boolean>;
/**
 * サーバー全体のログを出力する共通関数
 * @param tag カテゴリ
 * @param gameId ゲームID (任意)
 * @param roomId ルームID (任意)
 * @param msg メッセージ内容 (最後)
 */
export declare const server_log: (tag: LogCategory, gameId: string | null, roomId: string | null, msg: string) => void;
//# sourceMappingURL=logger.d.ts.map