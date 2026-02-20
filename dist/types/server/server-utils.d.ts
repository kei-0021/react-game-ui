import { GameName, PlayerId, RoomId } from '@/types/definition.js';
import { initialRoomState as IInitialRoomState, Location, ServerPlayer, TokenStoreDef } from '@/types/server.js';
import { Token } from '@/types/token.js';
export type LogCategory = 'connection' | 'deck' | 'card' | 'cell' | 'game' | 'dice' | 'timer' | 'addScore' | 'resource' | 'token' | 'room' | 'lobby' | 'disconnect' | 'warn' | 'popup' | 'custom_event';
export declare let LOG_CATEGORIES: Record<LogCategory, boolean>;
export declare function server_log(tag: LogCategory, gamePresetId: GameName, roomId: RoomId, ...args: any[]): void;
export declare const isExplored: (gameParam: IInitialRoomState, location: Location) => boolean;
export declare const markCellAsExplored: (gameParam: IInitialRoomState, gameName: string, roomId: RoomId, location: Location) => boolean;
export declare const unmarkCellAsExplored: (gameParam: IInitialRoomState, gameName: string, roomId: RoomId, location: Location) => boolean;
export declare const createRandomBoard: (initialBoard: any[][]) => any[][];
export declare const applyCellEffect: (gameParam: IInitialRoomState, gameName: string, roomId: RoomId, playerId: PlayerId, location: Location, cellEffects: Record<string, (params: any) => void>, addScore: (playerId: PlayerId, points: number) => void, updatePlayerResource: (playerId: PlayerId, resourceId: string, amount: number) => void, updatePlayerToken: (playerId: PlayerId, tokenId: string, amount: number) => void, requirePopup: (params: any) => void) => void;
export declare class TokenStore {
    id: string;
    name: string;
    tokens: Token[];
    constructor(id: string, name: string, initialTokens: any[]);
    getTokens(): Token[];
}
export declare class RoomManager {
    players: ServerPlayer[];
    initialResources: any[];
    initialTokenStores: any[];
    initialTokens: any[];
    board: any[][];
    exploredCells: Location[];
    turn: number;
    tokenStores: Map<string, TokenStore>;
    constructor(initialState: IInitialRoomState, initialTokenStoresDef: TokenStoreDef[]);
    getTokenStore(tokenStoreId: string): TokenStore | undefined;
    acquireToken(tokenStoreId: string, gameName: string, roomId: RoomId, playerId: PlayerId, tokenId: string): boolean;
    getFullState(): IInitialRoomState;
}
export declare const generateColorFromId: (id: string) => string;
//# sourceMappingURL=server-utils.d.ts.map