// src/server/server-utils.ts

import { Card } from "../types/card.js";
// -----------------------------------------------------------------
// ログ、型定義、ヘルパー関数、コアクラスの定義
// -----------------------------------------------------------------

export type Position = { row: number, col: number }

export type GameSettings = any
/** ログカテゴリの型定義 */
export type LogCategory =
    | "connection"
    | "deck"
    | "card"
    | "cell"
    | "game"
    | "dice"
    | "timer"
    | "addScore"
    | "resource"
    | "token"
    | "room"
    | "lobby"
    | "disconnect"
    | "warn"
    | "popup"
    | "custom_event";

/** ログ出力カテゴリ設定 */
export let LOG_CATEGORIES: Record<LogCategory, boolean> = {
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

const ANSI_RED = "\x1b[31m";
const ANSI_RESET = "\x1b[0m";

/**
 * サーバーログを出力する
 */
export function server_log(tag: LogCategory, gamePresetId: string, roomId: string, ...args: any[]): void {
    if (!LOG_CATEGORIES[tag]) return;

    if (tag === "warn") {
        console.warn(
            ANSI_RED + `[${tag}]` + ANSI_RESET,
            ...args.map((arg) => ANSI_RED + String(arg) + ANSI_RESET),
        );
    } else {
        console.log(`[${tag}] [${gamePresetId} (${roomId})]`, ...args);
    }
}

// -----------------------------------------------------------------
// 型定義 (TypeScript Interface)
// -----------------------------------------------------------------

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
    tokens: any[];
    position: Location;
}

export interface GameState {
    players: ServerPlayer[];
    initialResources: any[];
    initialTokenStores: any[];
    initialTokens: any[];
    board: any[][];
    exploredCells: Location[];
    turn: number;
}

export interface RoomGameInfo {
    roomId: string;
    gameName: string;
    createdAt: number;
    currentRoundIndex: number;
    currentTurnIndex: number;
    decks: Record<string, Card[]>;
    drawnCards: Record<string, Card[]>;
    playFieldCards: Record<string, Card[]>;
    discardPile: Record<string, any>;
    gameStateInstance: MockGameState;
    checkGameEnd: any;
    onGameEnd: any;
}

/** トークンストア初期化用の定義型 */
export interface TokenStoreDef {
    tokenStoreId: string;
    name: string;
    tokens: any[];
}

// -----------------------------------------------------------------
// 探索済みマス目のユーティリティ関数
// -----------------------------------------------------------------

/**
 * マスが探索済みリストに含まれているかチェックする
 */
export const isExplored = (gameStateInstance: MockGameState, location: Location): boolean => {
    return gameStateInstance.exploredCells.some(
        (loc) => loc.row === location.row && loc.col === location.col,
    );
};

/**
 * マスを探索済みとしてマークする
 */
export const markCellAsExplored = (
    gameStateInstance: MockGameState,
    gameName: string,
    roomId: string,
    location: Location,
): boolean => {
    if (!isExplored(gameStateInstance, location)) {
        gameStateInstance.exploredCells.push(location);
        server_log(
            "cell",
            gameName,
            roomId,
            `マス (${location.row}, ${location.col}) を探索済みとしてマークしました。`,
        );
        return true;
    }
    return false;
};

/**
 * 特定のマスを探索済みリストから削除する（未探索に戻す）
 */
export const unmarkCellAsExplored = (
    gameStateInstance: MockGameState,
    gameName: string,
    roomId: string,
    location: Location,
): boolean => {
    const initialLength = gameStateInstance.exploredCells.length;

    gameStateInstance.exploredCells = gameStateInstance.exploredCells.filter(
        (loc) => !(loc.row === location.row && loc.col === location.col),
    );

    const wasRemoved = gameStateInstance.exploredCells.length < initialLength;

    if (wasRemoved) {
        server_log(
            "cell",
            gameName,
            roomId,
            `マス (${location.row}, ${location.col}) の探索済みマークを解除しました。`,
        );
    }

    return wasRemoved;
};

// -----------------------------------------------------------------
// ボード初期化ユーティリティ関数
// -----------------------------------------------------------------

/** Fisher-Yates シャッフル */
const shuffleArray = <T>(array: T[]): T[] => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
};

/**
 * 初期ボードデータからランダムな確定盤面を作成
 */
export const createRandomBoard = (initialBoard: any[][]): any[][] => {
    if (
        !initialBoard ||
        initialBoard.length === 0 ||
        initialBoard[0].length === 0
    ) {
        server_log("warn", "SYSTEM", "N/A", "createRandomBoard: initialBoardが空です。");
        return [];
    }

    const rows = initialBoard.length;
    const cols = initialBoard[0].length;

    let allCells: any[] = [];
    initialBoard.forEach((rowArr) => {
        allCells = allCells.concat(rowArr);
    });

    shuffleArray(allCells);

    const newBoard: any[][] = [];
    let cellIndex = 0;

    for (let r = 0; r < rows; r++) {
        const newRow: any[] = [];
        for (let c = 0; c < cols; c++) {
            if (cellIndex >= allCells.length) break;

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

// -----------------------------------------------------------------
// タイル効果の適用ロジック
// -----------------------------------------------------------------

/**
 * プレイヤーが停止したマス目の効果を適用する
 */
export const applyCellEffect = (
    gameStateInstance: MockGameState,
    gameName: string,
    roomId: string,
    playerId: string,
    location: Location,
    cellEffects: Record<string, (params: any) => void>,
    addScore: (playerId: string, points: number) => void,
    updatePlayerResource: (playerId: string, resourceId: string, amount: number) => void,
    updatePlayerToken: (playerId: string, tokenId: string, amount: number) => void,
    requirePopup: (params: any) => void,
): void => {
    const { row, col } = location;

    if (
        row < 0 ||
        row >= gameStateInstance.board.length ||
        col < 0 ||
        col >= gameStateInstance.board[row].length
    ) {
        server_log(
            "warn",
            gameName,
            roomId,
            `applyCellEffect: 不正な座標 (${row}, ${col}) が指定されました。`,
        );
        return;
    }

    const cell = gameStateInstance.board[row][col];
    const effect = cellEffects[cell.name];

    if (effect) {
        server_log(
            "cell",
            gameName,
            roomId,
            `マス効果発動: ${cell.name} by ${playerId}`,
        );

        try {
            effect({
                playerId,
                addScore,
                updateResource: updatePlayerResource,
                updateToken: updatePlayerToken,
                requirePopup: requirePopup,
            });
        } catch (e) {
            server_log(
                "warn",
                gameName,
                roomId,
                `マス効果の実行中にエラーが発生しました: ${cell.name}`,
                e,
            );
        }
    } else {
        server_log(
            "cell",
            gameName,
            roomId,
            `マス効果なし: (${row}, ${col}) ${cell.name}`,
        );
    }
};

// -----------------------------------------------------------------
// TokenStore クラスと MockGameState クラスの定義
// -----------------------------------------------------------------

export class TokenStore {
    public id: string;
    public name: string;
    public tokens: any[];

    constructor(id: string, name: string, initialTokens: any[]) {
        this.id = id;
        this.name = name;
        this.tokens = [...initialTokens];
    }

    getTokens(): any[] {
        return this.tokens;
    }
}

export class MockGameState {
    public players: ServerPlayer[];
    public initialResources: any[];
    public initialTokens: any[];
    public board: any[][];
    public exploredCells: Location[];
    public turn: number;
    public tokenStores: Map<string, TokenStore>;

    constructor(initialState: GameState, initialTokenStoresDef: TokenStoreDef[]) {
        this.players = initialState.players;
        this.initialResources = initialState.initialResources;
        this.initialTokens = initialState.initialTokens;
        this.board = initialState.board;
        this.exploredCells = initialState.exploredCells;
        this.turn = initialState.turn;

        this.tokenStores = new Map<string, TokenStore>();
        initialTokenStoresDef.forEach((storeDef) => {
            this.tokenStores.set(
                storeDef.tokenStoreId,
                new TokenStore(storeDef.tokenStoreId, storeDef.name, storeDef.tokens),
            );
        });
    }

    getTokenStore(tokenStoreId: string): TokenStore | undefined {
        return this.tokenStores.get(tokenStoreId);
    }

    acquireToken(tokenStoreId: string, gameName: string, roomId: string, playerId: string, tokenId: string): boolean {
        const player = this.players.find((p) => p.id === playerId);
        if (!player) return false;

        if (tokenStoreId === "scoreboard-acquisition") {
            server_log(
                "token",
                gameName,
                roomId,
                `ユーザー ${playerId} が ScoreBoard 上でトークン ${tokenId} を操作しました。`,
            );

            if (!Array.isArray(player.tokens)) {
                player.tokens = [];
            }

            const token = {
                id: tokenId,
                name: `Token ${tokenId.slice(0, 4)}`,
                backColor: "#333",
                count: 1,
            };

            player.tokens.push(token);
            server_log(
                "token",
                gameName,
                roomId,
                `トークン ${tokenId} をプレイヤー ${playerId} のインベントリに再追加しました。`,
            );
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

                server_log(
                    "token",
                    gameName,
                    roomId,
                    `ユーザー ${playerId} がストア ${tokenStoreId} からトークン ${tokenId} を獲得しました。`,
                );
                return true;
            }
        }
        return false;
    }

    getFullState() {
        return {
            players: this.players,
            board: this.board,
            exploredCells: this.exploredCells,
            turn: this.turn,
        };
    }
}

// -----------------------------------------------------------------
// Player生成時に使う関数
// -----------------------------------------------------------------

export const generateColorFromId = (id: string): string => {
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