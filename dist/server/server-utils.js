export let LOG_CATEGORIES = {
    connection: true,
    deck: false,
    card: true,
    cell: true,
    game: true,
    dice: true,
    timer: false,
    addScore: true,
    resource: true,
    token: true,
    room: true,
    lobby: true,
    disconnect: true,
    warn: true,
    popup: true,
    custom_event: true,
};
const ANSI_RED = '\x1b[31m';
const ANSI_RESET = '\x1b[0m';
/**
 * サーバーの実行ログを出力する
 * @param tag - ログのカテゴリ
 * @param gameId - 対象のゲームプリセットID
 * @param roomId - 対象のルームID
 * @param firstArg - ログのメイン内容（1つ以上の引数が必須）
 * @param args - 追加のログ情報
 */
export function server_log(tag, gameId, roomId, firstArg, ...args) {
    if (!LOG_CATEGORIES[tag]) {
        throw new Error(`不正なログカテゴリで呼び出されました: ${tag}`);
    }
    const fullArgs = [firstArg, ...args];
    if (tag === 'warn') {
        const header = `[${tag}] [${gameId} (${roomId})]`;
        console.warn(ANSI_RED + header + ANSI_RESET, ...fullArgs.map((arg) => ANSI_RED + String(arg) + ANSI_RESET));
    }
    else {
        console.log(`[${tag}] [${gameId} (${roomId})]`, ...fullArgs);
    }
}
export const isExplored = (roomState, position) => {
    return roomState.exploredCells.some((loc) => loc.row === position.row && loc.col === position.col);
};
export const markCellAsExplored = (roomState, gameId, roomId, position) => {
    if (!isExplored(roomState, position)) {
        roomState.exploredCells.push(position);
        server_log('cell', gameId, roomId, `マス (${position.row}, ${position.col}) を探索済みとしてマークしました。`);
        return true;
    }
    return false;
};
export const unmarkCellAsExplored = (roomState, gameId, roomId, position) => {
    const initialLength = roomState.exploredCells.length;
    roomState.exploredCells = roomState.exploredCells.filter((loc) => !(loc.row === position.row && loc.col === position.col));
    const wasRemoved = roomState.exploredCells.length < initialLength;
    if (wasRemoved) {
        server_log('cell', gameId, roomId, `マス (${position.row}, ${position.col}) の探索済みマークを解除しました。`);
    }
    return wasRemoved;
};
const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
};
export const createRandomBoard = (initialBoard) => {
    if (!initialBoard || initialBoard.length === 0 || initialBoard[0].length === 0) {
        return [];
    }
    const rows = initialBoard.length;
    const cols = initialBoard[0].length;
    let allCells = [];
    initialBoard.forEach((rowArr) => {
        allCells = allCells.concat(rowArr);
    });
    shuffleArray(allCells);
    const newBoard = [];
    let cellIndex = 0;
    for (let r = 0; r < rows; r++) {
        const newRow = [];
        for (let c = 0; c < cols; c++) {
            if (cellIndex >= allCells.length)
                break;
            const originalCell = allCells[cellIndex];
            newRow.push({
                ...originalCell,
                id: `r${r}c${c}`,
            });
            cellIndex++;
        }
        if (newRow.length > 0) {
            newBoard.push(newRow);
        }
    }
    return newBoard;
};
export const generateColorFromId = (id) => {
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
        hash = (hash << 5) - hash + id.charCodeAt(i);
        hash |= 0;
    }
    const goldenRatioConjugate = 0.618033988749895;
    let hue = (Math.abs(hash) * goldenRatioConjugate) % 1;
    const finalHue = Math.floor(hue * 360);
    return `hsl(${finalHue}, 70%, 50%)`;
};
/**
 * ゲームにおける状態（State）の変更と、それに伴うサーバーログ出力を一括管理する。
 */
export class RoomManager {
    io;
    state;
    _phaseChanged = false;
    constructor(io, state) {
        this.io = io;
        this.state = state;
    }
    /**
     * プレイヤー状態を更新する
     */
    emitPlayerUpdate = () => {
        this.io.to(this.state.roomId).emit('players:update', this.state.players);
    };
    /**
     * フェーズが変更されたかどうかを取得する
     */
    get hasPhaseChanged() {
        return this._phaseChanged;
    }
    /**
     * スコアを加算する
     * @param playerId - 対象のプレイヤーのID
     * @param points - 加算するスコア
     */
    addScore(playerId, points) {
        const player = this.state.players.find((p) => p.id === playerId);
        if (!player)
            return;
        player.score = (player.score || 0) + points;
        server_log('addScore', this.state.gameId, this.state.roomId, `${player.name} に ${points}pt 加算`);
        this.emitPlayerUpdate();
    }
    /**
     * セル効果を発動する
     * @param playerId - 効果を発動させたプレイヤーのID
     * @param position - 発動対象となるマスの座標
     * @param cellEffects - 各セル名に対応する効果処理の定義集
     * @param updatePlayerResource - プレイヤーのリソース（資源）を更新するためのコールバック関数
     * @param updatePlayerToken - プレイヤーのトークン所持数を更新するためのコールバック関数
     * @param requirePopup - クライアント側でポップアップを表示させるための要求関数
     */
    applyCellEffect = (playerId, position, cellEffects, updatePlayerResource, updatePlayerToken, requirePopup) => {
        const { row, col } = position;
        // Record（オブジェクト）の最初の値（ボード配列）を取得
        const targetBoard = Object.values(this.state.board)[0];
        // ボードが存在しない、または座標が範囲外の場合のガード
        if (!targetBoard || row < 0 || row >= targetBoard.length || col < 0 || col >= targetBoard[row].length) {
            server_log('warn', this.state.gameId, this.state.roomId, `applyCellEffect: 不正な座標 (${row}, ${col}) またはボードがありません。`);
            return;
        }
        // 特定したボードからセルを取得
        const cell = targetBoard[row][col];
        const effect = cellEffects[cell.name];
        if (effect) {
            server_log('cell', this.state.gameId, this.state.roomId, `マス効果発動: ${cell.name} by ${playerId}`);
            try {
                effect({
                    playerId,
                    updateResource: updatePlayerResource,
                    updateToken: updatePlayerToken,
                    requirePopup: requirePopup,
                });
            }
            catch (e) {
                server_log('warn', this.state.gameId, this.state.roomId, `マス効果の実行中にエラーが発生しました: ${cell.name}`, e);
            }
        }
        else {
            server_log('cell', this.state.gameId, this.state.roomId, `マス効果なし: (${row}, ${col}) ${cell.name}`);
        }
    };
    /**
     * トークン置き場を取得する
     * @param tokenStoreId - トークン置き場ID
     */
    getTokenStore(tokenStoreId) {
        return this.state.tokenStores ? this.state.tokenStores[tokenStoreId] : undefined;
    }
    /**
     * トークンを取得する
     * @param tokenStoreId - トークン置き場ID
     * @param tokenId - トークンID
     * @param playerId - プレイヤーID
     */
    acquireToken(tokenStoreId, tokenId, playerId) {
        const player = this.state.players.find((p) => p.id === playerId);
        if (!player)
            return false;
        if (tokenStoreId === 'scoreboard-acquisition') {
            server_log('token', this.state.gameId, this.state.roomId, `ユーザー ${playerId} が ScoreBoard 上でトークン ${tokenId} を操作しました。`);
            if (!Array.isArray(player.tokens)) {
                player.tokens = [];
            }
            const token = {
                id: tokenId,
                name: `Token ${tokenId.slice(0, 4)}`,
                backColor: '#333',
                count: 1,
                imageSrc: '',
            };
            player.tokens.push(token);
            server_log('token', this.state.gameId, this.state.roomId, `トークン ${tokenId} をプレイヤー ${playerId} のインベントリに再追加しました。`);
            return true;
        }
        const store = this.getTokenStore(tokenStoreId);
        if (store) {
            const index = store.tokens.findIndex((t) => t.id === tokenId);
            if (index !== -1) {
                const acquiredToken = store.tokens.splice(index, 1)[0];
                if (!Array.isArray(player.tokens)) {
                    player.tokens = [];
                }
                player.tokens.push(acquiredToken);
                server_log('token', this.state.gameId, this.state.roomId, `ユーザー ${playerId} がストア ${tokenStoreId} からトークン ${tokenId} を獲得しました。`);
                return true;
            }
        }
        return false;
    }
    /**
     * フェーズを更新し、変更フラグを立てる
     * @param newPhase - 新しいフェーズ
     */
    updatePhase(newPhase) {
        if (this.state.currentPhase !== newPhase) {
            this.state.currentPhase = newPhase;
            this._phaseChanged = true;
            server_log('game', this.state.gameId, this.state.roomId, `フェーズを更新しました: ${newPhase}`);
        }
    }
}
