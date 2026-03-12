import { CardLocation } from '@/types/cardLocation.js';
import { CardState } from '@/types/cardState.js';
import { CardId, DeckId, GameId, PlayerId, ResourceId, RoomId, TokenId, TokenStoreId } from '@/types/definition.js';
import { Phase } from '@/types/phase.js';
import { Position } from '@/types/position.js';
import { GameParam, RoomState } from '@/types/server.js';
import { CardPlayData } from '@/types/socketData.js';
import { Server } from 'socket.io';
export type LogCategory = 'connection' | 'lobby' | 'game' | 'room' | 'deck' | 'card' | 'cell' | 'dice' | 'timer' | 'addScore' | 'resource' | 'token' | 'warn' | 'popup' | 'custom_event' | 'disconnect';
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
export declare const createRandomBoard: (initialBoard: any[][]) => any[][];
export declare const generateColorFromId: (id: string) => string;
/**
 * ゲームにおける状態（State）の変更と、それに伴うサーバーログ出力を一括管理する。
 */
export declare class RoomManager {
    private io;
    private param;
    private state;
    constructor(io: Server, param: GameParam, state: RoomState);
    /**
     * 一定時間待機する
     * @param ms - 待機時間 (ms)
     */
    sleep: (ms: number) => Promise<unknown>;
    /**
     * プレイヤー更新を通知する
     */
    emitPlayerUpdate: () => void;
    /**
     * デッキ更新を通知する
     */
    emitDeckUpdate: (deckId: DeckId) => void;
    /**
     * トークン置き場更新を通知する
     */
    emitTokenStoreUpdate: (tokenStoreId: TokenStoreId) => void;
    /**
     * SystemMessageWindowコンポーネントにシステムメッセージを出力する
     * @param message - メッセージ内容
     * @param ms=0 - メッセージ表示時間 (ms)
     * @param isPersistent=false - 次のメッセージが出るまで表示し続けるかどうかのフラグ
     * @returns 待機が完了した時に解決されるPromise
     */
    emitSystemMessage: (message: string, ms?: number, isPersistent?: boolean) => Promise<void>;
    /**
     * カードをデッキから引く
     */
    drawCard(deckId: DeckId, condition: [CardLocation, CardState], playerId?: PlayerId): boolean;
    /**
     * カードをプレイする
     */
    playCard(data: CardPlayData): void;
    /**
     * ホールド状態を解除し、カードを出す
     */
    unholdCards(): void;
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
     * リソースを取得する
     * @param playerId - 対象のプレイヤーのID
     * @param resourceId - 対象のリソースID
     * @param amount - 加算する個数
     */
    acquireResource: (playerId: PlayerId, resourceId: ResourceId, amount: number) => void;
    /**
     * トークンを取得する
     * @param tokenStoreId - トークン置き場ID
     * @param tokenId - トークンID。null ならランダムでトークンを置き場から選ぶ
     * @param playerId - プレイヤーID
     */
    acquireToken(tokenStoreId: TokenStoreId, tokenId: (TokenId | null) | undefined, playerId: PlayerId): void;
    /**
     * 特定のセルの探索状態を切り替える
     * @param {Position} position - 操作対象の座標
     * @param {boolean} shouldMark - 探索済みにする場合は true、解除する場合は false
     * @returns {boolean} 状態が実際に変化した場合は true
     */
    updateCellExploredStatus: (position: Position, shouldMark: boolean) => boolean;
    /**
     * セル効果を発動する
     * @param playerId - 効果を発動させたプレイヤーのID
     * @param position - 発動対象となるマスの座標
     * @param cellEffects - 各セル名に対応する効果処理の定義集
     * @param updatePlayerResource - プレイヤーのリソース（資源）を更新するためのコールバック関数
     * @param updatePlayerToken - プレイヤーのトークン所持数を更新するためのコールバック関数
     * @param requirePopup - クライアント側でポップアップを表示させるための要求関数
     */
    applyCellEffect: (playerId: PlayerId, position: Position, cellEffects: Record<string, (manager: RoomManager, playerId: PlayerId) => void>) => void;
    /**
     * ターンを更新する
     */
    updateTurn(): void;
    /**
     * ラウンドを更新する
     */
    updateRound(): void;
    /**
     * フェーズを更新する
     * @param newPhase - 新しいフェーズ
     */
    updatePhase(newPhase: Phase): void;
}
//# sourceMappingURL=server-utils.d.ts.map