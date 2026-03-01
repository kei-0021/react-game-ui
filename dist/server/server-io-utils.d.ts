import { GameId } from '@/types/definition.js';
import { RoomParam } from '@/types/server.js';
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
    setup: (loadedData: Record<string, any>) => Promise<RoomParam>;
};
/**
 * プリセット準備の関数群
 */
export declare const helpers: {
    assertCards: (data: Card[]) => Card[];
    createUniqueCards: <T extends {
        id: string;
    }>(data: T[], numSets: number) => T[];
    createBoardLayout: (base: any[], counts: Record<string, number>, cols: number) => any[][];
    createTokenStore: (_id: string, _name: string, templates: any[], count: number) => any[];
};
//# sourceMappingURL=server-io-utils.d.ts.map