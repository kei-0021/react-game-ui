import { GameId, PlayerId, RoomId } from '@/types/definition.js';
import { Position } from '@/types/position.js';
import { RoomState } from '@/types/server.js';
import { TokenStore } from '@/types/tokenStore.js';
export type LogCategory = 'connection' | 'deck' | 'card' | 'cell' | 'game' | 'dice' | 'timer' | 'addScore' | 'resource' | 'token' | 'room' | 'lobby' | 'disconnect' | 'warn' | 'popup' | 'custom_event';
export declare let LOG_CATEGORIES: Record<LogCategory, boolean>;
/**
 * サーバーの実行ログを出力する
 * @param tag - ログのカテゴリ
 * @param gamePresetId - 対象のゲームプリセットID
 * @param roomId - 対象のルームID
 * @param firstArg - ログのメイン内容（1つ以上の引数が必須）
 * @param args - 追加のログ情報
 */
export declare function server_log(tag: LogCategory, gamePresetId: GameId, roomId: RoomId, firstArg: any, ...args: any[]): void;
export declare const isExplored: (roomState: RoomState, position: Position) => boolean;
export declare const markCellAsExplored: (roomState: RoomState, gameId: GameId, roomId: RoomId, position: Position) => boolean;
export declare const unmarkCellAsExplored: (roomState: RoomState, gameId: GameId, roomId: RoomId, position: Position) => boolean;
export declare const createRandomBoard: (initialBoard: any[][]) => any[][];
export declare const applyCellEffect: (roomState: RoomState, gameId: GameId, roomId: RoomId, playerId: PlayerId, position: Position, cellEffects: Record<string, (params: any) => void>, addScore: (playerId: PlayerId, points: number) => void, updatePlayerResource: (playerId: PlayerId, resourceId: string, amount: number) => void, updatePlayerToken: (playerId: PlayerId, tokenId: string, amount: number) => void, requirePopup: (params: any) => void) => void;
export declare class RoomManager {
    private state;
    private gameId;
    private roomId;
    constructor(state: RoomState, gameId: GameId, roomId: RoomId);
    getTokenStore(tokenStoreId: string): TokenStore | undefined;
    acquireToken(roomState: RoomState, tokenStoreId: string, gameId: GameId, roomId: RoomId, playerId: PlayerId, tokenId: string): boolean;
}
export declare const generateColorFromId: (id: string) => string;
//# sourceMappingURL=server-utils.d.ts.map