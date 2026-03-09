import { GameId } from '@/types/definition.js';
import { GameParam } from '@/types/server.js';
import { Token } from '@/types/token.js';
import { Card } from '../types/card.js';
import { Resource } from '../types/resource.js';
export declare const Validators: {
    isCardArray: (data: Card[]) => data is Card[];
    isResourceArray: (data: any) => data is Resource[];
    isCellArray: (data: any) => data is any[];
};
/**
 * 内部でバリデーションまで完結させる JSON ローダー
 */
export declare function loadJsonAssert<T>(relativePath: string, validator: (data: any) => data is T): T;
export type RoomConfig = {
    gameId: GameId;
    dataFiles: Record<string, any>;
    setup: (loadedData: Record<string, any>) => Promise<GameParam>;
};
/**
 * プリセット準備の関数群
 */
export declare class SetupHelper {
    /**
     * カードデータのバリデーション
     */
    assertCards(data: any): Card[];
    /**
     * カードに共通のプロパティ（location, drawConditionなど）をセットする
     */
    initializeCards(cards: any[], defaults: Partial<Card>): Card[];
    /**
     * カードの複製（ユニーク化）
     */
    createUniqueCards(cards: Card[], numSets: number): Card[];
    /**
     * トークンストアの生成。共通情報の初期化も可能。
     * @param tokens - 入力トークンデータ
     * @param count - トークン置き場に置くトークンの数
     * @param imageSrc - トークンの画像URL（省略可能）
     * @param color - トークンの背景用のカラーコード（省略可能）
     * @returns トークン置き場
     */
    createTokenStore(tokens: Token[], count: number, imageSrc?: string, color?: string): Token[];
    /**
     * ボードレイアウトの生成
     */
    createBoardLayout(base: any[], counts: Record<string, number>, cols: number): any[][];
}
//# sourceMappingURL=server-io-utils.d.ts.map