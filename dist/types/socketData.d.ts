import { CellData } from '@/index.js';
import { Card } from './card.js';
import { CardLocation } from './cardLocation.js';
import { CardState } from './cardState.js';
import { Coordinate } from './coodinate.js';
import { BoardId, CardId, DeckId, DraggableId, GameId, PlayerId, RoomId, TokenId, TokenStoreId } from './definition.js';
import { Phase } from './phase.js';
import { Token } from './token.js';
export type RoomMeta = {
    id: RoomId;
    gameId: GameId;
    playerCount: number;
    maxPlayers?: number;
    createdAt: number;
};
export type RoomJoinData = {
    roomId: RoomId;
    gameId: GameId;
    playerName: PlayerId;
};
export type DeckDrawData = {
    roomId: RoomId;
    deckId: DeckId;
    playerId?: PlayerId | null;
    drawCondition: [CardLocation, CardState];
};
export type DeckUpdateData = {
    currentDeck: Card[];
    playFieldCards: Card[];
    discardPile: Card[];
};
export type CardPlayData = {
    roomId: RoomId;
    deckId: DeckId;
    cardIds: CardId[];
    playerId: PlayerId;
    playLocation: CardLocation;
    coordinate: Coordinate;
};
export type CardHoldData = {
    roomId: RoomId;
    playerId: PlayerId;
    cardIdsbyDeck: Record<DeckId, CardId[]>;
};
export type CardFlipData = {
    roomId: RoomId;
    playerId: PlayerId;
    cardIds: CardId[];
};
export type CardMoveOnFieldData = {
    roomId: RoomId;
    deckId: DeckId;
    cardId: string;
    coordinate?: Coordinate;
    zIndex?: number;
};
export type CardMoveFromFieldData = {
    roomId: RoomId;
    deckId: DeckId;
    cardId: string;
    playerId?: PlayerId | null;
};
export type TokenAcquireData = {
    roomId: RoomId;
    tokenStoreId: TokenStoreId;
    tokenId: TokenId;
};
export type TokenStoreUpdateData = {
    tokenStore: Token[];
};
export type BoardMovableRangeData = {
    roomId: RoomId;
    boardId: BoardId;
    playerId: PlayerId;
    moveRange: number;
};
export type BaordMovePlayerData = {
    roomId: RoomId;
    boardId: BoardId;
    playerId: PlayerId;
    newLocation: any;
};
export type BoardUpdateData = {
    boardId: BoardId;
    board: CellData[];
};
export type DraggableMovedData = {
    roomId: RoomId;
    draggableId: DraggableId;
    coordinate: Coordinate;
    rotation: number;
};
export type DraggableUpdateData = {
    draggableId: DraggableId;
    coordinate: Coordinate;
    rotation: number;
    zIndex: number;
};
export type ObjectBringToFrontData = {
    roomId: RoomId;
    objectId: [DeckId, CardId] | DraggableId;
    type: string;
};
export type GamePhaseUpdateData = {
    newPhase: Phase;
};
export type GameNextTrunData = {
    roomId: RoomId;
};
export type GameNextRoundData = {
    roomId: RoomId;
};
export type GameTurnUpdateData = {
    currentPlayerId: PlayerId;
    currentRoundIndex: number;
    currentTurnIndex: number;
};
export type SystemMessageData = {
    message: string;
    isPersistent?: boolean;
};
//# sourceMappingURL=socketData.d.ts.map