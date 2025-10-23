// src/server/server-utils.js
// -----------------------------------------------------------------
// ログ、型定義、ヘルパー関数、コアクラスの定義
// -----------------------------------------------------------------

// ログ出力カテゴリ設定（true=出力, false=非表示）
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
  custom_event: true
};

const ANSI_RED = '\x1b[31m';
const ANSI_RESET = '\x1b[0m';

/**
 * サーバーログを出力する
 * @param {string} tag - ログカテゴリタグ
 * @param {...any} args - 出力する値
 */
export function server_log(tag, ...args) {
  if (!LOG_CATEGORIES[tag]) return;
  
  if (tag === 'warn') {
    console.warn(ANSI_RED + `[${tag}]` + ANSI_RESET, ...args.map(arg => ANSI_RED + String(arg) + ANSI_RESET));
  } else {
    console.log(`[${tag}]`, ...args);
  }
}

// -----------------------------------------------------------------
// 型定義 (JSDoc)
// -----------------------------------------------------------------

/**
 * @typedef {object} Location
 * @property {number} row
 * @property {number} col
 */

/**
 * @typedef {object} ServerPlayer
 * @property {string} id
 * @property {string} name
 * @property {string} socketId 
 * @property {any[]} cards
 * @property {number} score
 * @property {any[]} resources
 * @property {any[]} tokens
 * @property {Location} position
 */

/**
 * @typedef {object} GameState
 * @property {ServerPlayer[]} players
 * @property {any[]} initialResources
 * @property {any[]} initialTokenStores 
 * @property {any[]} initialTokens
 * @property {any[][]} board
 * @property {Location[]} exploredCells 
 * @property {number} turn
 */

/**
 * ルームごとのゲームメタ情報
 * @typedef {object} RoomGameInfo
 * @property {string} roomId 
 * @property {number} createdAt
 * @property {number} currentTurnIndex
 * @property {object} decks
 * @property {object} drawnCards
 * @property {object} playFieldCards
 * @property {object} discardPile
 * @property {MockGameState} gameStateInstance
 */


// -----------------------------------------------------------------
// 探索済みマス目のユーティリティ関数
// -----------------------------------------------------------------

/**
 * マスが探索済みリストに含まれているかチェックする
 * @param {MockGameState} gameStateInstance
 * @param {Location} location
 * @returns {boolean}
 */
export const isExplored = (gameStateInstance, location) => {
    return gameStateInstance.exploredCells.some(loc => loc.row === location.row && loc.col === location.col);
};

/**
 * マスを探索済みとしてマークする
 * @param {MockGameState} gameStateInstance
 * @param {Location} location
 * @returns {boolean} - 更新されたかどうか
 */
export const markCellAsExplored = (gameStateInstance, location) => {
    if (!isExplored(gameStateInstance, location)) {
        gameStateInstance.exploredCells.push(location);
        server_log('cell', `マス (${location.row}, ${location.col}) を探索済みとしてマークしました。`);
        return true; 
    }
    return false;
};

/**
 * 特定のマスを探索済みリストから削除する（未探索に戻す）
 * @param {MockGameState} gameStateInstance
 * @param {Location} location
 * @returns {boolean} - 削除されたかどうか
 */
export const unmarkCellAsExplored = (gameStateInstance, location) => {
    const initialLength = gameStateInstance.exploredCells.length;
    
    gameStateInstance.exploredCells = gameStateInstance.exploredCells.filter(loc => 
        !(loc.row === location.row && loc.col === location.col)
    );

    const wasRemoved = gameStateInstance.exploredCells.length < initialLength;

    if (wasRemoved) {
        server_log('cell', `マス (${location.row}, ${location.col}) の探索済みマークを解除しました。`);
    }
    
    return wasRemoved;
};

// -----------------------------------------------------------------
// ボード初期化ユーティリティ関数
// -----------------------------------------------------------------

// Fisher-Yates シャッフル
const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
};

/**
 * 初期ボードデータからランダムな確定盤面を作成
 * @param {any[][]} initialBoard - 初期ボード定義（配列の配列）
 * @returns {any[][]} - ランダムに配置された盤面
 */
export const createRandomBoard = (initialBoard) => {
    if (!initialBoard || initialBoard.length === 0 || initialBoard[0].length === 0) {
        server_log("warn", "createRandomBoard: initialBoardが空です。");
        return [];
    }
    
    const rows = initialBoard.length;
    const cols = initialBoard[0].length; 
    
    let allCells = [];
    initialBoard.forEach(rowArr => {
        allCells = allCells.concat(rowArr);
    });

    shuffleArray(allCells);

    const newBoard = [];
    let cellIndex = 0;

    for (let r = 0; r < rows; r++) {
        const newRow = [];
        for (let c = 0; c < cols; c++) {
            if (cellIndex >= allCells.length) break; 
            
            const originalCell = allCells[cellIndex];
            
            newRow.push({ 
                ...originalCell, 
              id: `r${r}c${c}`
            });
            cellIndex++;
        }
        if (newRow.length > 0) {
            newBoard.push(newRow);
        }
    }
    
    return newBoard;
};

// -----------------------------------------------------------------
// タイル効果の適用ロジック
// -----------------------------------------------------------------

/**
 * プレイヤーが停止したマス目の効果を適用する
 * @param {MockGameState} gameStateInstance - 現在のゲーム状態インスタンス
 * @param {string} playerId - 効果を適用するプレイヤーのID
 * @param {Location} location - プレイヤーが停止したマス目の座標
 * @param {object} cellEffects - マス効果定義 (effectName: function)
 * @param {function(string, number): void} addScore - スコア加算ヘルパー関数 (playerId, points)
 * @param {function(string, string, number): void} updatePlayerResource - リソース更新ヘルパー関数 (playerId, resourceId, amount)
 * @param {function(string, string, number): void} updatePlayerToken - トークン更新ヘルパー関数 (playerId, tokenId, amount)
 * @param {function(string, string, number): void} updatePlayerToken - トークン更新ヘルパー関数 (playerId, tokenId, amount)
 */
export const applyCellEffect = (
    gameStateInstance,
    playerId,
    location,
    cellEffects,
    addScore,
    updatePlayerResource,
    updatePlayerToken,
    requirePopup
) => {
    const { row, col } = location;
    
    if (row < 0 || row >= gameStateInstance.board.length || col < 0 || col >= gameStateInstance.board[row].length) {
        server_log("warn", `applyCellEffect: 不正な座標 (${row}, ${col}) が指定されました。`);
        return;
    }

    const cell = gameStateInstance.board[row][col];
    const effect = cellEffects[cell.name];
    
    if (effect) {
        server_log("cell", `マス効果発動: ${cell.name} by ${playerId}`);
        
        try {
          // ヘルパー関数をバインドした関数を渡す
          effect({ 
            playerId, 
            addScore, 
            updateResource: updatePlayerResource, 
            updateToken: updatePlayerToken,
            requirePopup: requirePopup
          }); 
        } catch (e) {
            server_log("warn", `マス効果の実行中にエラーが発生しました: ${cell.name}`, e);
        }
    } else {
        server_log("cell", `マス効果なし: (${row}, ${col}) ${cell.name}`);
    }
};

// -----------------------------------------------------------------
// MockGameState クラスと TokenStore クラスの定義
// -----------------------------------------------------------------

export class TokenStore {
    /**
     * @param {string} id 
     * @param {string} name 
     * @param {any[]} initialTokens 
     */
    constructor(id, name, initialTokens) {
        this.id = id;
        this.name = name;
        this.tokens = [...initialTokens];
    }
    getTokens() {
        return this.tokens;
    }
}

export class MockGameState {
    /**
     * @param {GameState} initialState
     * @param {any[]} initialTokenStoresDef
     */
    constructor(initialState, initialTokenStoresDef) {
        this.players = initialState.players;
        this.initialResources = initialState.initialResources;
        this.initialTokens = initialState.initialTokens;
        this.board = initialState.board;
        this.exploredCells = initialState.exploredCells;
        this.turn = initialState.turn;

        /** @type {Map<string, TokenStore>} */
        this.tokenStores = new Map();
        initialTokenStoresDef.forEach(storeDef => {
            this.tokenStores.set(storeDef.tokenStoreId, new TokenStore(storeDef.tokenStoreId, storeDef.name, storeDef.tokens));
        });
    }

    /**
     * @param {string} tokenStoreId
     * @returns {TokenStore | undefined}
     */
    getTokenStore(tokenStoreId) {
        return this.tokenStores.get(tokenStoreId);
    }
    
    /**
     * トークン獲得ロジックを処理する
     * @param {string} tokenStoreId - 獲得元のストアID 
     * @param {string} playerId - プレイヤーID 
     * @param {string} tokenId 
     * @returns {boolean} 成功したかどうか
     */
    acquireToken(tokenStoreId, playerId, tokenId) {
        const player = this.players.find(p => p.id === playerId);
        if (!player) return false;

        if (tokenStoreId === 'scoreboard-acquisition') {
            server_log('token', `ユーザー ${playerId} が ScoreBoard 上でトークン ${tokenId} を操作しました。`);

            if (!Array.isArray(player.tokens)) {
                player.tokens = [];
            }

            const token = { 
                id: tokenId, 
                name: `Token ${tokenId.slice(0, 4)}`, 
                backColor: '#333',
                count: 1
            };
            
            player.tokens.push(token); 
            server_log('token', `トークン ${tokenId} をプレイヤー ${playerId} のインベントリに再追加しました。`);
            return true;
        }

        const store = this.tokenStores.get(tokenStoreId);
        if (store) {
            const index = store.tokens.findIndex(t => t.id === tokenId);
            if (index !== -1) {
                const acquiredToken = store.tokens.splice(index, 1)[0];
                
                if (!Array.isArray(player.tokens)) {
                    player.tokens = [];
                }
                
                player.tokens.push(acquiredToken);

                server_log('token', `ユーザー ${playerId} がストア ${tokenStoreId} からトークン ${tokenId} を獲得しました。`);
                return true;
            }
        }
        return false;
    }
    
    /**
     * クライアントに送信する状態のサブセットを取得
     */
    getFullState() {
        return {
            players: this.players,
            board: this.board,
            exploredCells: this.exploredCells,
            turn: this.turn,
        };
    }
}