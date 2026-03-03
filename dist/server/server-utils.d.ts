import { CardLocation } from '@/types/cardLocation.js';
import { CardState } from '@/types/cardState.js';
import { CardId, DeckId, GameId, PlayerId, RoomId, TokenId, TokenStoreId } from '@/types/definition.js';
import { Phase } from '@/types/phase.js';
import { Position } from '@/types/position.js';
import { RoomState } from '@/types/server.js';
import { TokenStore } from '@/types/tokenStore.js';
import { Server } from 'socket.io';
export type LogCategory = 'connection' | 'deck' | 'card' | 'cell' | 'game' | 'dice' | 'timer' | 'addScore' | 'resource' | 'token' | 'room' | 'lobby' | 'disconnect' | 'warn' | 'popup' | 'custom_event';
export declare let LOG_CATEGORIES: Record<LogCategory, boolean>;
/**
 * サーバーの実行ログを出力する
 * @param tag - ログのカテゴリ
 * @param gameId - 対象のゲームプリセットID
 * @param roomId - 対象のルームID
 * @param firstArg - ログのメイン内容（1つ以上の引数が必須）
 * @param args - 追加のログ情報
 */
export declare function server_log(tag: LogCategory, gameId: GameId, roomId: RoomId, firstArg: any, ...args: any[]): void;
export declare const isExplored: (roomState: RoomState, position: Position) => boolean;
export declare const markCellAsExplored: (roomState: RoomState, gameId: GameId, roomId: RoomId, position: Position) => boolean;
export declare const unmarkCellAsExplored: (roomState: RoomState, gameId: GameId, roomId: RoomId, position: Position) => boolean;
export declare const createRandomBoard: (initialBoard: any[][]) => any[][];
export declare const generateColorFromId: (id: string) => string;
/**
 * ゲームにおける状態（State）の変更と、それに伴うサーバーログ出力を一括管理する。
 */
export declare class RoomManager {
    private io;
    private state;
    constructor(io: Server, state: RoomState);
    /**
     * プレイヤー更新を更新する
     */
    emitPlayerUpdate: () => void;
    /**
     * デッキ更新を通知する
     */
    emitDeckUpdate: (deckId: DeckId) => void;
    /**
     * カードをデッキから引く（移動ロジックの外注先）
     */
    drawCard(deckId: DeckId, condition: [CardLocation, CardState], playerId?: PlayerId): boolean;
    /**
     * フィールドからカードを回収（手札に戻す or 捨て札へ）
     */
    moveFromField(deckId: DeckId, cardId: CardId, playerId?: PlayerId | null): boolean;
    /**
     * スコアを加算する
     * @param playerId - 対象のプレイヤーのID
     * @param points - 加算するスコア
     */
    addScore(playerId: PlayerId, points: number): void;
    /**
     * セル効果を発動する
     * @param playerId - 効果を発動させたプレイヤーのID
     * @param position - 発動対象となるマスの座標
     * @param cellEffects - 各セル名に対応する効果処理の定義集
     * @param updatePlayerResource - プレイヤーのリソース（資源）を更新するためのコールバック関数
     * @param updatePlayerToken - プレイヤーのトークン所持数を更新するためのコールバック関数
     * @param requirePopup - クライアント側でポップアップを表示させるための要求関数
     */
    applyCellEffect: (playerId: PlayerId, position: Position, cellEffects: Record<string, (params: any) => void>, updatePlayerResource: (playerId: PlayerId, resourceId: string, amount: number) => void, updatePlayerToken: (playerId: PlayerId, tokenId: string, amount: number) => void, requirePopup: (params: any) => void) => void;
    /**
     * トークン置き場を取得する
     * @param tokenStoreId - トークン置き場ID
     */
    getTokenStore(tokenStoreId: TokenStoreId): TokenStore | undefined;
    /**
     * トークンを取得する
     * @param tokenStoreId - トークン置き場ID
     * @param tokenId - トークンID
     * @param playerId - プレイヤーID
     */
    acquireToken(tokenStoreId: TokenStoreId, tokenId: TokenId, playerId: PlayerId): boolean;
    /**
     * フェーズを更新する
     * @param newPhase - 新しいフェーズ
     */
    updatePhase(newPhase: Phase): void;
}
//# sourceMappingURL=server-utils.d.ts.map