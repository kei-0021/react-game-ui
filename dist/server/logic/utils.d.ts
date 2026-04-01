/**
 * oldVal に存在しないキーのみ newVal から補完する。
 * 既に値がある場合は、newVal 側の値が何であれ書き換えを行わない。
 */
export declare const deepFill: (oldVal: any, newVal: any, excludeKeys?: string[], path?: string) => void;
/**
 * oldVal をベースに newVal の内容で上書き、または結合する。
 */
export declare const deepMerge: (oldVal: any, newVal: any) => any;
export declare const generateColorFromId: (id: string) => string;
export declare const shuffleArray: <T>(array: T[]) => T[];
//# sourceMappingURL=utils.d.ts.map