import { server_log } from './log/logger.js';
import { BoardManager } from './logic/board-manager.js';
import { DeckManager } from './logic/deck-manager.js';
import { TokenManager } from './logic/token-manager.js';
export const isExplored = (roomState, position) => {
    return roomState.exploredCells.some((loc) => loc.row === position.row && loc.col === position.col);
};
/**
 * ゲームにおける状態（State）の変更と、それに伴うサーバーログ出力を一括管理する。
 */
export class RoomManager {
    io;
    param;
    state;
    constructor(io, param, state) {
        this.io = io;
        this.param = param;
        this.state = state;
    }
    /**
     * サーバーの実行ログを出力する
     * @param tag - ログのカテゴリ
     * @param gameId - 対象のゲームプリセットID
     * @param roomId - 対象のルームID
     * @param msg - ログのメイン内容
     * @param level - ログレベル (デフォルト: INFO)
     */
    server_log(tag, msg, level = 'INFO') {
        server_log(tag, this.state.gameId, this.state.roomId, msg, level);
    }
    /**
     * 一定時間待機する
     * @param ms - 待機時間 (ms)
     */
    sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    /**
     * プレイヤー更新を通知する
     */
    emitPlayerUpdate = () => {
        this.io.to(this.state.roomId).emit('players:update', this.state.players);
    };
    /**
     * デッキ更新を通知する
     */
    emitDeckUpdate = (deckId) => {
        const updateData = {
            currentDeck: this.state.decks[deckId].filter((c) => c.location === 'deck'),
            playFieldCards: this.state.playFieldCards[deckId],
            discardPile: this.state.discardPile[deckId],
        };
        this.io.to(this.state.roomId).emit(`deck:update:${deckId}`, updateData);
    };
    /**
     * トークン置き場更新を通知する
     */
    emitTokenStoreUpdate = (tokenStoreId) => {
        const updateData = { tokenStore: this.state.tokenStores[tokenStoreId] };
        this.io.to(this.state.roomId).emit(`token-store:update:${tokenStoreId}`, updateData);
    };
    /**
     * 盤面更新を通知する
     */
    emitBoardUpdate = (boardId) => {
        this.io.to(this.state.roomId).emit('board:update', {
            board: this.state.boards[boardId],
            boardTokens: Object.values(this.state.boardTokens).flat(),
        });
    };
    /**
     * セルの状態更新を通知する
     */
    emitCellUpdate = () => {
        this.io.to(this.state.roomId).emit('cell:update', this.state.exploredCells);
    };
    /**
     * ドラッグ可能オブジェクトの更新を通知する
     */
    emitDraggableUpdate = (draggableId) => {
        const updateData = {
            draggableId: draggableId,
            coordinate: this.state.draggables[draggableId].coordinate,
            rotation: this.state.draggables[draggableId].rotation,
            zIndex: this.state.draggables[draggableId].zIndex,
        };
        this.io.to(this.state.roomId).emit('draggable:update', updateData);
    };
    /**
     * SystemMessageWindowコンポーネントにシステムメッセージを出力する
     * @param message - メッセージ内容
     * @param ms=0 - メッセージ表示時間 (ms)
     * @param isPersistent=false - 次のメッセージが出るまで表示し続けるかどうかのフラグ
     * @returns 待機が完了した時に解決されるPromise
     */
    emitSystemMessage = async (message, ms = 0, isPersistent = false) => {
        // 重複チェック: 履歴内に同じメッセージが存在すれば追加しない
        if (!this.state.systemMessageHistory.includes(message)) {
            // 最新10件に制限しつつ追加
            this.state.systemMessageHistory = [...this.state.systemMessageHistory.slice(-9), message];
        }
        this.io.to(this.state.roomId).emit('system:message', { message, isPersistent });
        await this.sleep(ms);
    };
    /**
     * カードをデッキから引く
     */
    drawCard(deckId, condition, playerId) {
        const deckManager = new DeckManager(this.param, this.state);
        deckManager.drawCard(deckId, condition, playerId);
        this.emitDeckUpdate(deckId);
        this.emitPlayerUpdate();
    }
    /**
     * デッキをシャッフルする
     */
    shuffleDeck = (deckId) => {
        const deckManager = new DeckManager(this.param, this.state);
        deckManager.shuffleDeck(deckId);
    };
    /**
     * カードをプレイする
     */
    playCard(data) {
        const deckManager = new DeckManager(this.param, this.state);
        deckManager.playCard(data, this);
        this.emitDeckUpdate(data.deckId);
        this.emitPlayerUpdate();
    }
    /**
     * ホールド状態を解除し、カードを出す
     */
    unholdCards() {
        const deckManager = new DeckManager(this.param, this.state);
        deckManager.unholdCards(this);
    }
    /**
     * フィールドからカードを回収（手札に戻す or 捨て札へ）
     */
    moveFromField(deckId, cardId, playerId) {
        const deckManager = new DeckManager(this.param, this.state);
        deckManager.moveFromField(deckId, cardId, playerId);
        this.emitDeckUpdate(deckId);
        this.emitPlayerUpdate();
    }
    /**
     * トークンを取得する
     * @param tokenStoreId - トークン置き場ID
     * @param tokenId - トークンID。null ならランダムでトークンを置き場から選ぶ
     * @param playerId - プレイヤーID
     */
    acquireToken(tokenStoreId, tokenId = null, playerId) {
        const tokenManager = new TokenManager(this.state);
        tokenManager.acquireToken(tokenStoreId, tokenId, playerId);
        this.emitTokenStoreUpdate(tokenStoreId);
    }
    /**
     * 指定したセルから一定歩数で行けるセルIDをすべて取得する
     * isExact: true の場合、moveRange と同じ歩数のセルのみを返す
     */
    getMovableCellIds = (boardId, startCellId, moveRange, isExact) => {
        const tokenManager = new TokenManager(this.state);
        return tokenManager.getMovableCellIds(boardId, startCellId, moveRange, isExact);
    };
    /**
     * 特定のセルの探索状態を切り替える
     * @param {Position} position - 操作対象の座標
     * @param {boolean} shouldMark - 探索済みにする場合は true、解除する場合は false
     * @returns {boolean} 状態が実際に変化した場合は true
     */
    updateCellExploredStatus = (position, shouldMark) => {
        const boardManager = new BoardManager(this.state);
        boardManager.updateCellExploredStatus(position, shouldMark);
        this.emitCellUpdate();
    };
    /**
     * セル効果を発動する
     * @param boardId - ボードID
     * @param playerId - 効果を発動させたプレイヤーのID
     * @param position - 発動対象となるマスの座標
     * @param cellEffects - 各セル名に対応する効果処理の定義集
     */
    applyCellEffect = (boardId, playerId, position, cellEffects) => {
        const boardManager = new BoardManager(this.state);
        boardManager.applyCellEffect(boardId, playerId, position, cellEffects, this);
    };
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
        this.server_log('addScore', `${player.name} に ${points}pt 加算`);
        this.emitPlayerUpdate();
    }
    /**
     * リソースを取得する
     * @param playerId - 対象のプレイヤーのID
     * @param resourceId - 対象のリソースID
     * @param amount - 加算する個数
     */
    acquireResource = (playerId, resourceId, amount) => {
        const player = this.state.players.find((p) => p.id === playerId);
        const resource = player?.resources?.find((r) => r.resourceId === resourceId);
        if (resource) {
            resource.currentValue = Math.min(resource.maxValue, Math.max(0, resource.currentValue + amount));
            this.server_log('resource', `${player.name}: ${resource.name} 更新`);
            this.emitPlayerUpdate();
        }
    };
    /**
     * タイマーを停止させる
     */
    stopTimer = () => {
        const timer = this.state.timer;
        if (timer) {
            clearTimeout(timer);
            this.server_log('timer', `タイマー停止`);
        }
    };
    /**
     * 重ね順を更新する
     */
    updateZIndex(type, objectId, isToFront) {
        if (isToFront == true) {
            if (type === 'card') {
                if (!Array.isArray(objectId)) {
                    throw new Error("Invalid objectId for type 'card': expected a tuple [DeckId, CardId]");
                }
                this.server_log('deck', 'カードのz-indexを最全面に移動');
                const card = this.state.playFieldCards[objectId[0]]?.find((c) => c.id === objectId[1]);
                if (!card)
                    return;
                if (!card.zIndex || card.zIndex < this.state.maxZIndex) {
                    this.state.maxZIndex++;
                    card.zIndex = this.state.maxZIndex;
                    this.server_log('draggable', `新しいz-index: ${this.state.maxZIndex}`, 'DEBUG');
                    this.emitDeckUpdate(objectId[0]);
                }
            }
            else {
                if (Array.isArray(objectId)) {
                    throw new Error("Invalid objectId for type 'draggable': expected a string, but received a tuple");
                }
                this.server_log('draggable', 'ドラッグ可能オブジェクトを最前面に移動');
                const draggable = this.state.draggables[objectId];
                if (draggable.zIndex < this.state.maxZIndex) {
                    this.state.maxZIndex++;
                    draggable.zIndex = this.state.maxZIndex;
                    this.server_log('draggable', `新しいz-index: ${this.state.maxZIndex}`, 'DEBUG');
                    this.emitDraggableUpdate(objectId);
                }
            }
        }
        else {
            if (type === 'card') {
                if (!Array.isArray(objectId)) {
                    throw new Error("Invalid objectId for type 'card': expected a tuple [DeckId, CardId]");
                }
                this.server_log('deck', 'カードのを最背面に移動');
                const card = this.state.playFieldCards[objectId[0]]?.find((c) => c.id === objectId[1]);
                if (!card)
                    return;
                if (!card.zIndex)
                    card.zIndex = 100;
                // 100枚規模の衝突を回避する正規化
                card.zIndex = 100 + (card.zIndex % 100);
                this.server_log('draggable', `新しいz-index: ${card.zIndex}`, 'DEBUG');
                this.emitDeckUpdate(objectId[0]);
            }
            else {
                if (Array.isArray(objectId)) {
                    throw new Error("Invalid objectId for type 'draggable': expected a string, but received a tuple");
                }
                this.server_log('draggable', 'ドラッグ可能オブジェクトを最背面に移動');
                const draggable = this.state.draggables[objectId];
                // 100枚規模の衝突を回避する正規化
                draggable.zIndex = 100 + (draggable.zIndex % 100);
                this.server_log('draggable', `新しいz-index: ${draggable.zIndex}`, 'DEBUG');
                this.emitDraggableUpdate(objectId);
            }
        }
    }
    /**
     * ターンを更新する
     */
    updateTurn() {
        if (this.state.players.length === 0)
            return;
        // カスタムフック処理
        const checkGameEnd = this.param?.checkGameEnd;
        const onGameEnd = this.param?.onGameEnd;
        if (checkGameEnd && checkGameEnd(this.state) && onGameEnd) {
            const results = onGameEnd(this.state);
            this.io.to(this.state.roomId).emit('game:end', results);
            return;
        }
        // ターンが一周した場合は次のラウンドへ移行する
        const nextIndex = this.state.currentTurnIndex + 1;
        const isRoundEnd = nextIndex % this.state.players.length === 0;
        // 初回（0ターン目）のラウンド移行を防ぎつつ、一周した時だけラウンドを進める
        if (nextIndex > 0 && isRoundEnd) {
            this.state.currentRoundIndex += 1;
            const onNextRound = this.param?.onNextRound;
            if (onNextRound) {
                onNextRound(this.state, this);
            }
        }
        this.state.currentTurnIndex = nextIndex;
        const currentPlayer = this.state.players[this.state.currentTurnIndex % this.state.players.length];
        this.server_log('game', `ターン更新 (Player: ${this.state.players[this.state.currentTurnIndex]?.name}, RoundIndex: ${this.state.currentRoundIndex})`);
        this.io.to(this.state.roomId).emit('game:turn', {
            currentPlayerId: currentPlayer?.id,
            currentRoundIndex: this.state.currentRoundIndex,
            currentTurnIndex: this.state.currentTurnIndex,
        });
    }
    /**
     * ラウンドを更新する
     */
    updateRound() {
        if (this.state.players.length === 0)
            return;
        // カスタムフック処理
        const checkGameEnd = this.param?.checkGameEnd;
        const onGameEnd = this.param?.onGameEnd;
        if (checkGameEnd && checkGameEnd(this.state) && onGameEnd) {
            const results = onGameEnd(this.state);
            this.io.to(this.state.roomId).emit('game:end', results);
            return;
        }
        // 次のラウンドへ移行する
        this.state.currentRoundIndex += 1;
        const currentPlayer = this.state.players[this.state.currentTurnIndex % this.state.players.length];
        // カスタムフック処理
        const onNextRound = this.param?.onNextRound;
        if (onNextRound) {
            onNextRound(this.state, this);
        }
        this.server_log('room', `ラウンド更新 (Player: ${this.state.players[this.state.currentTurnIndex]?.name}, RoundIndex: ${this.state.currentRoundIndex})`);
        this.io.to(this.state.roomId).emit('game:turn', {
            currentPlayerId: currentPlayer?.id,
            currentRoundIndex: this.state.currentRoundIndex,
            currentTurnIndex: this.state.currentTurnIndex,
        });
    }
    /**
     * フェーズを更新する
     * @param newPhase - 新しいフェーズ
     */
    updatePhase(newPhase) {
        if (this.state.currentPhase !== newPhase) {
            this.state.currentPhase = newPhase;
            this.server_log('phase', `フェーズを更新しました: ${newPhase}`);
            this.io.to(this.state.roomId).emit('phase:update', {
                newPhase: this.state.currentPhase,
            });
        }
    }
}
