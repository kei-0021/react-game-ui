import { RoomManager } from '@/server/server-utils.js';
import { Card } from './card.js';
import { Deck } from './deck.js';
import { DeckId, GameName, RoomId } from './definition.js';
import { Token } from './token.js';
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
export type Position = {
    col: number;
    row: number;
};
export type Coordinate = {
    x: number;
    y: number;
};
export type RoomParam = {
    name: GameName;
    initialDecks: Deck[];
    initialHand: any;
    initialResources: any;
    initialTokenStores: any;
    initialTokens: any;
    initialBoard: any;
    checkGameEnd: any;
    onGameEnd: any;
};
export type initialRoomState = {
    players: ServerPlayer[];
    initialResources: any[];
    initialTokenStores: any[];
    initialTokens: any[];
    board: any[][];
    exploredCells: Location[];
    turn: number;
};
export interface RoomState {
    roomId: RoomId;
    gameName: string;
    createdAt: number;
    currentRoundIndex: number;
    currentTurnIndex: number;
    decks: Record<DeckId, Card[]>;
    drawnCards: Record<string, Card[]>;
    playFieldCards: Record<string, Card[]>;
    discardPile: Record<string, Card[]>;
    initRoomState: RoomManager;
    checkGameEnd: any;
    onGameEnd: any;
}
/** トークンストア初期化用の定義型 */
export interface TokenStoreDef {
    tokenStoreId: string;
    name: string;
    tokens: any[];
}
//# sourceMappingURL=server.d.ts.map