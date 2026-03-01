import { DeckId, GameId } from '@/types/definition.js';
import { Card } from '../types/card.js';
import { Resource } from '../types/resource.js';
export declare const Validators: {
    isCardArray: (data: any) => data is Card[];
    isResourceArray: (data: any) => data is Resource[];
    isCellArray: (data: any) => data is any[];
};
/**
 * 内部でバリデーションまで完結させる JSON ローダー
 */
export declare function loadJsonAssert<T>(relativePath: string, validator: (data: any) => data is T): T;
/**
 * 指定した枚数分、IDをユニークにしながらデータを複製する
 * デッキのセット数を増やしたい時に便利
 */
export declare const replicateData: <T extends {
    id: string;
}>(data: T[], numSets: number) => T[];
/**
 * テンプレート配列と個数設定から、フラットな配置用配列を作る
 */
export declare const generateFromTemplates: <T extends {
    templateId: string;
}>(templates: T[], counts: Record<string, number>) => T[];
/**
 * 1次元配列を2次元（ボード形式）に変換する
 */
export declare const chunkTo2D: <T>(array: T[], cols: number) => T[][];
export type Config = {
    gameId: GameId;
    dataFiles: Record<string, any>;
    setup: any;
};
export interface SetupTools {
    assertCards: (cards: Card[], deckId: DeckId) => Card[];
    createUniqueCards: (cards: Card[], numSets: number) => Card[];
    createTokenStore: (id: string, name: string, templates: any[], count: number) => any[];
    createBoardLayout: (baseCells: any[], cellCounts: Record<string, number>, rows: number, cols: number) => any[][];
}
//# sourceMappingURL=server-io-utils.d.ts.map