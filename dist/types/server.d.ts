import { RoomManager } from '@/server/server-utils.js';
import { Card } from './card.js';
import { Deck } from './deck.js';
import { BoardId, DeckId, GameId, PlayerId, RoomId, TokenId } from './definition.js';
import { Resource } from './resource.js';
import { Token } from './token.js';
import { TokenStoreDef } from './tokenStore.js';
export interface ServerPlayer {
    id: PlayerId;
    name: string;
    socketId: string;
    color: string;
    cards: Card[];
    score: number;
    resources: Resource[];
    tokens: Token[];
    position: Position;
}
export type Position = {
    col: number;
    row: number;
};
export type RoomMeta = {
    id: RoomId;
    gameId: GameId;
    playerCount: number;
    maxPlayers?: number;
    createdAt: number;
};
/**
 * ゲームルーム作成時の初期設定パラメータ。
 * @param gameId - ゲームを一意に識別するID。
 * @param maxPlayers - 最大プレイヤー数（任意）。
 * @param initialDecks - デッキの初期構成リスト。
 * @param initialHand - 初期手札設定。{ deckId, count }
 * @param initialResources - プレイヤーの初期リソース。
 * @param initialTokenStores - 共有トークンの保管場所。
 * @param initialTokens - ボード上の初期配置トークン。
 * @param cardEffects - カードの特殊効果定義。
 * @param cellEffects - セルの特殊効果定義。
 * @param initialBoard - ボードの初期レイアウト。
 * @param checkGameEnd - 終了判定ロジック。
 * @param onGameEnd - リザルト生成ロジック。
 */
export type RoomParam = {
    gameId: GameId;
    maxPlayers?: number;
    initialDecks: Deck[];
    initialHand?: {
        deckId: DeckId;
        count: number;
    };
    initialResources?: Resource[];
    initialTokenStores?: TokenStoreDef[];
    initialTokens?: {
        tokenId: TokenId;
        count: number;
    };
    cardEffects?: any;
    cellEffects?: any;
    initialBoard?: Record<BoardId, any>;
    checkGameEnd?: any;
    onGameEnd?: any;
};
export type initialRoomState = {
    players: ServerPlayer[];
    initialResources: any[];
    initialTokenStores: any[];
    initialTokens: any[];
    board: Record<BoardId, any[][]>;
    exploredCells: Position[];
    turn: number;
};
export interface RoomState {
    roomId: RoomId;
    gameId: GameId;
    createdAt: number;
    maxPlayers?: number;
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
export { GameId };
//# sourceMappingURL=server.d.ts.map