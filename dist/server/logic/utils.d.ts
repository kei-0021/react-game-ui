/**
 * target に存在しないキーのみ source から補完する。
 * 既に値がある場合は、source 側の値が何であれ書き換えを行わない。
 */
export declare const deepFill: (target: any, source: any, excludeKeys?: string[], path?: string) => void;
export declare const deepMerge: (target: any, source: any) => any;
export declare const generateColorFromId: (id: string) => string;
export declare const shuffleArray: <T>(array: T[]) => T[];
//# sourceMappingURL=utils.d.ts.map