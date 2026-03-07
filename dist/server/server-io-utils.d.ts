import { GameId } from '@/types/definition.js';
import { GameParam } from '@/types/server.js';
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
     * ボードレイアウトの生成
     */
    createBoardLayout(base: any[], counts: Record<string, number>, cols: number): any[][];
    /**
     * トークンストアの生成
     */
    createTokenStore(_id: string, _name: string, templates: any[], count: number): any[];
}
//# sourceMappingURL=server-io-utils.d.ts.map