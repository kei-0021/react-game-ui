import { server_log } from '../log/logger.js';
export class TokenManager {
    state;
    constructor(state) {
        this.state = state;
    }
    /**
     * トークンを取得する
     * @param tokenStoreId - トークン置き場ID
     * @param tokenId - トークンID。null ならランダムでトークンを置き場から選ぶ
     * @param playerId - プレイヤーID
     */
    acquireToken(tokenStoreId, tokenId = null, playerId) {
        const player = this.state.players.find((p) => p.id === playerId);
        if (!player)
            return;
        const tokens = this.state.tokenStores[tokenStoreId];
        if (tokens.length === 0)
            return;
        // tokenId が指定されていればそのインデックス、null ならランダムなインデックスを選択
        const index = tokenId !== null ? tokens.findIndex((t) => t.id === tokenId) : Math.floor(Math.random() * tokens.length);
        if (index !== -1) {
            const acquiredToken = tokens.splice(index, 1)[0];
            if (!Array.isArray(player.tokens)) {
                player.tokens = [];
            }
            player.tokens.push(acquiredToken);
            server_log('token', this.state.gameId, this.state.roomId, `${player.name} (${playerId}) がストア ${tokenStoreId} からトークン ${acquiredToken.id} を獲得しました。`);
        }
    }
    /**
     * 手持ちから盤面へトークンを移動する
     */
    playToken(tokenId, playerId, newLocation) {
        const player = this.state.players.find((p) => p.id === playerId);
        if (!player)
            return;
        // 先に対象のトークンを確保する
        const targetToken = player.tokens.find((t) => t.id === tokenId);
        if (!targetToken)
            return;
        // プレイヤーのリストから除外
        player.tokens = player.tokens.filter((t) => t.id !== tokenId);
        // 盤面に移動（Recordに追加）
        this.state.boardTokens[tokenId] = {
            ...targetToken,
            position: newLocation,
        };
        server_log('token', this.state.gameId, this.state.roomId, `PLAY: ${targetToken.name} (ID:${targetToken.id}) (${playerId} -> ${newLocation.row}, ${newLocation.col})`);
    }
    /**
     * 指定したセルから一定歩数で行けるセルIDをすべて取得する
     * isExact: true の場合、moveRange と同じ歩数のセルのみを返す
     */
    getMovableCellIds = (boardId, startCellId, moveRange, isExact) => {
        const targetBoard = this.state.boards[boardId];
        const boardMap = new Map(targetBoard.map((c) => [c.id, c]));
        const reachable = new Set();
        const queue = [{ id: startCellId, dist: 0 }];
        const visited = new Set([startCellId]);
        while (queue.length > 0) {
            const { id, dist } = queue.shift();
            // 登録条件の判定
            if (dist > 0) {
                if (isExact) {
                    // isExactフラグがtrueなら、指定歩数と同じ場合のみ登録
                    if (dist === moveRange)
                        reachable.add(id);
                }
                else {
                    // 通常時は今まで通り移動範囲内すべて
                    reachable.add(id);
                }
            }
            // 探索継続の判定（移動範囲を超えたら隣接は探さない）
            if (dist >= moveRange)
                continue;
            const cell = boardMap.get(id);
            cell?.adjacentCellIds.forEach((nextId) => {
                if (!visited.has(nextId)) {
                    visited.add(nextId);
                    queue.push({ id: nextId, dist: dist + 1 });
                }
            });
        }
        return Array.from(reachable);
    };
}
