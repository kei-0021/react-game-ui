/** ログカテゴリの型定義 */
export type LogCategory = "connection" | "deck" | "card" | "cell" | "game" | "dice" | "timer" | "addScore" | "resource" | "token" | "room" | "lobby" | "disconnect" | "warn" | "popup" | "custom_event";
/** ログ出力カテゴリ設定 */
export declare let LOG_CATEGORIES: Record<LogCategory, boolean>;
/**
 * サーバーログを出力する
 */
export declare function server_log(tag: LogCategory, gamePresetId: string, roomId: string, ...args: any[]): void;
export interface Location {
    row: number;
    col: number;
}
export interface ServerPlayer {
    id: string;
    name: string;
    socketId: string;
    cards: any[];
    score: number;
    resources: any[];
    tokens: any[];
    position: Location;
}
export interface GameState {
    players: ServerPlayer[];
    initialResources: any[];
    initialTokenStores: any[];
    initialTokens: any[];
    board: any[][];
    exploredCells: Location[];
    turn: number;
}
export interface RoomGameInfo {
    roomId: string;
    createdAt: number;
    currentTurnIndex: number;
    decks: Record<string, any>;
    drawnCards: Record<string, any>;
    playFieldCards: Record<string, any>;
    discardPile: Record<string, any>;
    gameStateInstance: MockGameState;
}
/** トークンストア初期化用の定義型 */
export interface TokenStoreDef {
    tokenStoreId: string;
    name: string;
    tokens: any[];
}
/**
 * マスが探索済みリストに含まれているかチェックする
 */
export declare const isExplored: (gameStateInstance: MockGameState, location: Location) => boolean;
/**
 * マスを探索済みとしてマークする
 */
export declare const markCellAsExplored: (gameStateInstance: MockGameState, gameName: string, roomId: string, location: Location) => boolean;
/**
 * 特定のマスを探索済みリストから削除する（未探索に戻す）
 */
export declare const unmarkCellAsExplored: (gameStateInstance: MockGameState, gameName: string, roomId: string, location: Location) => boolean;
/**
 * 初期ボードデータからランダムな確定盤面を作成
 */
export declare const createRandomBoard: (initialBoard: any[][]) => any[][];
/**
 * プレイヤーが停止したマス目の効果を適用する
 */
export declare const applyCellEffect: (gameStateInstance: MockGameState, gameName: string, roomId: string, playerId: string, location: Location, cellEffects: Record<string, (params: any) => void>, addScore: (playerId: string, points: number) => void, updatePlayerResource: (playerId: string, resourceId: string, amount: number) => void, updatePlayerToken: (playerId: string, tokenId: string, amount: number) => void, requirePopup: (params: any) => void) => void;
export declare class TokenStore {
    id: string;
    name: string;
    tokens: any[];
    constructor(id: string, name: string, initialTokens: any[]);
    getTokens(): any[];
}
export declare class MockGameState {
    players: ServerPlayer[];
    initialResources: any[];
    initialTokens: any[];
    board: any[][];
    exploredCells: Location[];
    turn: number;
    tokenStores: Map<string, TokenStore>;
    constructor(initialState: GameState, initialTokenStoresDef: TokenStoreDef[]);
    getTokenStore(tokenStoreId: string): TokenStore | undefined;
    acquireToken(tokenStoreId: string, gameName: string, roomId: string, playerId: string, tokenId: string): boolean;
    getFullState(): {
        players: ServerPlayer[];
        board: any[][];
        exploredCells: Location[];
        turn: number;
    };
}
export declare const generateColorFromId: (id: string) => string;
//# sourceMappingURL=server-utils.d.ts.map