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
 * @param gamePresetId - 対象のゲームプリセットID
 * @param roomId - 対象のルームID
 * @param firstArg - ログのメイン内容（1つ以上の引数が必須）
 * @param args - 追加のログ情報
 */
export function server_log(tag, gamePresetId, roomId, firstArg, ...args) {
    if (!LOG_CATEGORIES[tag]) {
        throw new Error(`不正なログカテゴリで呼び出されました: ${tag}`);
    }
    const fullArgs = [firstArg, ...args];
    if (tag === 'warn') {
        const header = `[${tag}] [${gamePresetId} (${roomId})]`;
        console.warn(ANSI_RED + header + ANSI_RESET, ...fullArgs.map((arg) => ANSI_RED + String(arg) + ANSI_RESET));
    }
    else {
        console.log(`[${tag}] [${gamePresetId} (${roomId})]`, ...fullArgs);
    }
}
export const isExplored = (gameParam, position) => {
    return gameParam.exploredCells.some((loc) => loc.row === position.row && loc.col === position.col);
};
export const markCellAsExplored = (gameParam, gameId, roomId, position) => {
    if (!isExplored(gameParam, position)) {
        gameParam.exploredCells.push(position);
        server_log('cell', gameId, roomId, `マス (${position.row}, ${position.col}) を探索済みとしてマークしました。`);
        return true;
    }
    return false;
};
export const unmarkCellAsExplored = (gameParam, gameId, roomId, position) => {
    const initialLength = gameParam.exploredCells.length;
    gameParam.exploredCells = gameParam.exploredCells.filter((loc) => !(loc.row === position.row && loc.col === position.col));
    const wasRemoved = gameParam.exploredCells.length < initialLength;
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
        server_log('warn', 'SYSTEM', 'N/A', 'createRandomBoard: initialBoardが空です。');
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
export const applyCellEffect = (gameParam, gameId, roomId, playerId, position, cellEffects, addScore, updatePlayerResource, updatePlayerToken, requirePopup) => {
    const { row, col } = position;
    if (row < 0 || row >= gameParam.board.length || col < 0 || col >= gameParam.board[row].length) {
        server_log('warn', gameId, roomId, `applyCellEffect: 不正な座標 (${row}, ${col}) が指定されました。`);
        return;
    }
    const cell = gameParam.board[row][col];
    const effect = cellEffects[cell.name];
    if (effect) {
        server_log('cell', gameId, roomId, `マス効果発動: ${cell.name} by ${playerId}`);
        try {
            effect({
                playerId,
                addScore,
                updateResource: updatePlayerResource,
                updateToken: updatePlayerToken,
                requirePopup: requirePopup,
            });
        }
        catch (e) {
            server_log('warn', gameId, roomId, `マス効果の実行中にエラーが発生しました: ${cell.name}`, e);
        }
    }
    else {
        server_log('cell', gameId, roomId, `マス効果なし: (${row}, ${col}) ${cell.name}`);
    }
};
export class TokenStore {
    id;
    name;
    tokens;
    constructor(id, name, initialTokens) {
        this.id = id;
        this.name = name;
        this.tokens = [...initialTokens];
    }
    getTokens() {
        return this.tokens;
    }
}
export class RoomManager {
    players;
    initialResources;
    initialTokenStores;
    initialTokens;
    board;
    exploredCells;
    turn;
    tokenStores;
    constructor(initialState, initialTokenStoresDef) {
        this.players = initialState.players;
        this.initialResources = initialState.initialResources;
        this.initialTokenStores = initialState.initialTokenStores;
        this.initialTokens = initialState.initialTokens;
        this.board = initialState.board;
        this.exploredCells = initialState.exploredCells;
        this.turn = initialState.turn;
        this.tokenStores = new Map();
        initialTokenStoresDef.forEach((storeDef) => {
            this.tokenStores.set(storeDef.tokenStoreId, new TokenStore(storeDef.tokenStoreId, storeDef.name, storeDef.tokens));
        });
    }
    getTokenStore(tokenStoreId) {
        return this.tokenStores.get(tokenStoreId);
    }
    acquireToken(tokenStoreId, gameId, roomId, playerId, tokenId) {
        const player = this.players.find((p) => p.id === playerId);
        if (!player)
            return false;
        if (tokenStoreId === 'scoreboard-acquisition') {
            server_log('token', gameId, roomId, `ユーザー ${playerId} が ScoreBoard 上でトークン ${tokenId} を操作しました。`);
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
            server_log('token', gameId, roomId, `トークン ${tokenId} をプレイヤー ${playerId} のインベントリに再追加しました。`);
            return true;
        }
        const store = this.tokenStores.get(tokenStoreId);
        if (store) {
            const index = store.tokens.findIndex((t) => t.id === tokenId);
            if (index !== -1) {
                const acquiredToken = store.tokens.splice(index, 1)[0];
                if (!Array.isArray(player.tokens)) {
                    player.tokens = [];
                }
                player.tokens.push(acquiredToken);
                server_log('token', gameId, roomId, `ユーザー ${playerId} がストア ${tokenStoreId} からトークン ${tokenId} を獲得しました。`);
                return true;
            }
        }
        return false;
    }
    getFullState() {
        return {
            players: this.players,
            initialResources: this.initialResources,
            initialTokenStores: this.initialTokenStores,
            initialTokens: this.initialTokens,
            board: this.board,
            exploredCells: this.exploredCells,
            turn: this.turn,
        };
    }
}
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
