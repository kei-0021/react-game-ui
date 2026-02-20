import { Deck } from '@/types/deck.js';
import { DeckId, GameName, PlayerId, RoomId } from '@/types/definition.js';
import { Token } from '@/types/token.js';
import { Card } from '../types/card.js';
export type Position = {
    col: number;
    row: number;
};
export type Coordinate = {
    x: number;
    y: number;
};
export type GameSettings = {
    name: GameName;
    initialDecks: Deck[];
    initialHand: any;
    initialResources: any;
    initialTokenStore: any;
    initialTokens: any;
    initialBoard: any;
    checkGameEnd: any;
    onGameEnd: any;
};
/** ログカテゴリの型定義 */
export type LogCategory = 'connection' | 'deck' | 'card' | 'cell' | 'game' | 'dice' | 'timer' | 'addScore' | 'resource' | 'token' | 'room' | 'lobby' | 'disconnect' | 'warn' | 'popup' | 'custom_event';
/** ログ出力カテゴリ設定 */
export declare let LOG_CATEGORIES: Record<LogCategory, boolean>;
/**
 * サーバーログを出力する
 */
export declare function server_log(tag: LogCategory, gamePresetId: GameName, roomId: RoomId, ...args: any[]): void;
export interface Location {
    row: number;
    col: number;
}
export interface ServerPlayer {
    id: string;
    name: string;
    socketId: string;
    color: string;
    cards: Card[];
    score: number;
    resources: any[];
    tokens: Token[];
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
    gameName: string;
    createdAt: number;
    currentRoundIndex: number;
    currentTurnIndex: number;
    decks: Record<DeckId, Card[]>;
    drawnCards: Record<string, Card[]>;
    playFieldCards: Record<string, Card[]>;
    discardPile: Record<string, Card[]>;
    gameStateInstance: GameState;
    checkGameEnd: any;
    onGameEnd: any;
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
export declare const isExplored: (gameStateInstance: GameState, location: Location) => boolean;
/**
 * マスを探索済みとしてマークする
 */
export declare const markCellAsExplored: (gameStateInstance: GameState, gameName: string, roomId: string, location: Location) => boolean;
/**
 * 特定のマスを探索済みリストから削除する（未探索に戻す）
 */
export declare const unmarkCellAsExplored: (gameStateInstance: GameState, gameName: string, roomId: string, location: Location) => boolean;
/**
 * 初期ボードデータからランダムな確定盤面を作成
 */
export declare const createRandomBoard: (initialBoard: any[][]) => any[][];
/**
 * プレイヤーが停止したマス目の効果を適用する
 */
export declare const applyCellEffect: (gameStateInstance: GameState, gameName: string, roomId: string, playerId: string, location: Location, cellEffects: Record<string, (params: any) => void>, addScore: (playerId: string, points: number) => void, updatePlayerResource: (playerId: string, resourceId: string, amount: number) => void, updatePlayerToken: (playerId: string, tokenId: string, amount: number) => void, requirePopup: (params: any) => void) => void;
export declare class TokenStore {
    id: PlayerId;
    name: string;
    tokens: Token[];
    constructor(id: string, name: string, initialTokens: any[]);
    getTokens(): Token[];
}
export declare class GameState {
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