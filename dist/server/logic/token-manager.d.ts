import { BoardId, CellId, PlayerId, TokenId, TokenStoreId } from '@/types/definition.js';
import { Position } from '@/types/position.js';
import { RoomState } from '@/types/roomState.js';
export declare class TokenManager {
    private state;
    constructor(state: RoomState);
    /**
     * トークンを取得する
     * @param tokenStoreId - トークン置き場ID
     * @param tokenId - トークンID。null ならランダムでトークンを置き場から選ぶ
     * @param playerId - プレイヤーID
     */
    acquireToken(tokenStoreId: TokenStoreId, tokenId: (TokenId | null) | undefined, playerId: PlayerId): void;
    /**
     * 手持ちから盤面へトークンを移動する
     */
    playToken(tokenId: TokenId, playerId: PlayerId, newLocation: Position): void;
    /**
     * 指定したセルから一定歩数で行けるセルIDをすべて取得する
     * isExact: true の場合、moveRange と同じ歩数のセルのみを返す
     */
    getMovableCellIds: (boardId: BoardId, startCellId: CellId, moveRange: number, isExact: boolean) => CellId[];
}
//# sourceMappingURL=token-manager.d.ts.map