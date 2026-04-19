import { CellData, DraggableData, GameParam } from '@/index.js';
import { Coordinate } from '@/types/coodinate.js';
import { GameId } from '@/types/definition.js';
import { TokenData } from '@/types/token.js';
import { CardData } from '../types/card.js';
import { Resource } from '../types/resource.js';
export type RoomConfig = {
    gameId: GameId;
    dataFiles: Record<string, any>;
    setup: (loadedData: Record<string, any>) => Promise<GameParam>;
};
export declare const Validators: {
    isCardArray: (data: CardData[]) => data is CardData[];
    isResourceArray: (data: any) => data is Resource[];
    isCellArray: (data: any) => data is any[];
};
/**
 * 内部でバリデーションまで完結させる JSON ローダー
 */
export declare function loadJsonAssert<T>(relativePath: string, validator: (data: any) => data is T): T;
/**
 * プリセット準備の関数群
 */
export declare class SetupHelper {
    /**
     * カードデータのバリデーション
     */
    assertCards(data: any): CardData[];
    /**
     * カードに共通のプロパティ（location, drawConditionなど）をセットする
     */
    initializeCards(cards: any[], defaults: Partial<CardData>): CardData[];
    /**
     * カードの複製（ユニーク化）
     */
    createUniqueCards(cards: CardData[], numSets: number): CardData[];
    /**
     * トークンストアの生成。共通情報の初期化も可能。
     * @param tokens - 入力トークンデータ
     * @param count - トークン置き場に置くトークンの数
     * @param imageSrc - トークンの画像URL（省略可能）
     * @param color - トークンの背景用のカラーコード（省略可能）
     * @returns トークン置き場
     */
    createTokenStore(tokens: TokenData[], count: number, imageSrc?: string, color?: string): TokenData[];
    /**
     * グリッド状ボードレイアウトの生成
     */
    createGridBoardLayout(base: any[], counts: Record<string, number>, rows: number, cols?: number): CellData[];
    /**
     * ドラッグ可能オブジェクトの生成
     */
    createDraggable(id: string, coordinate?: Coordinate, zIndex?: number, rotation?: number): DraggableData;
}
//# sourceMappingURL=server-io-utils.d.ts.map