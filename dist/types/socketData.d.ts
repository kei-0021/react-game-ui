import type { CardData } from './card.js';
import type { CardLocation } from './cardLocation.js';
import type { CardState } from './cardState.js';
import type { CellData } from './cell.js';
import type { ComponentInfo } from './component.js';
import type { Coordinate } from './coodinate.js';
import type { BoardId, CardId, DeckId, DiceId, DraggableId, GameId, PieceId, PlayerId, RoomId, TokenId, TokenStoreId } from './definition.js';
import type { GameParam } from './gameParam.js';
import type { Phase } from './phase.js';
import { PieceData } from './piece.js';
import type { RoomState } from './roomState.js';
import type { TokenData } from './token.js';
export type RoomMeta = {
    id: RoomId;
    gameId: GameId;
    playerCount: number;
    maxPlayers?: number;
    createdAt: number;
};
export type LobbyGameList = {
    games: GameParam[];
};
export type LobbyRoomList = {
    rooms: RoomMeta[];
};
export interface GameComponentData {
    state: RoomState;
    components: ComponentInfo[];
}
export type RoomJoinData = {
    roomId: RoomId;
    gameId: GameId;
    playerName: PlayerId;
};
export type GameCreateData = {
    gameName: string;
    gameIcon: string;
};
export type GameDeleteData = {
    gameId: GameId;
};
export type GameParamUpdateData = {
    gameId: GameId;
    newParam: Partial<GameParam>;
};
export type DeckDrawData = {
    roomId: RoomId;
    deckId: DeckId;
    playerId?: PlayerId | null;
    drawCondition: [CardLocation, CardState];
};
export type DeckShuffleData = {
    roomId: RoomId;
    deckId: DeckId;
};
export type DeckResetData = {
    roomId: RoomId;
    deckId: DeckId;
};
export type DeckUpdateData = {
    currentDeck: CardData[];
    playFieldCards: CardData[];
    discardPile: CardData[];
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
    rotation?: number;
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
    tokenStore: TokenData[];
};
export type BoardMovableRangeData = {
    roomId: RoomId;
    boardId: BoardId;
    playerId: PlayerId;
    moveRange: number;
    isExact: boolean;
};
export type BaordMovePieceData = {
    roomId: RoomId;
    boardId: BoardId;
    pieceId: PieceId;
    newLocation: any;
};
export type BoardUpdateData = {
    boardId: BoardId;
    board: CellData[];
    extraPieces: PieceData[];
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
export type DiceRollData = {
    roomId: RoomId;
    diceId: DiceId;
    sides: number;
};
export type DiceUpdateData = {
    value: number;
};
export type ObjectBringToData = {
    roomId: RoomId;
    objectId: [DeckId, CardId] | DraggableId;
    type: 'card' | 'draggable';
    isFront: boolean;
};
export type PhaseUpdateData = {
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