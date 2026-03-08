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
    param;
    state;
    constructor(io, param, state) {
        this.io = io;
        this.param = param;
        this.state = state;
    }
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
        this.io.to(this.state.roomId).emit(`deck:update:${this.state.roomId}:${deckId}`, updateData);
    };
    /**
     * トークン置き場更新を通知する
     */
    emitTokenStoreUpdate = (tokenStoreId) => {
        const updateData = { tokenStore: this.state.tokenStores[tokenStoreId] };
        this.io.to(this.state.roomId).emit(`token-store:update`, updateData);
    };
    emitSystemMessage = (message, isPersistent = false) => {
        // 重複チェック: 履歴内に同じメッセージが存在すれば追加しない
        if (!this.state.systemMessageHistory.includes(message)) {
            // 最新10件に制限しつつ追加
            this.state.systemMessageHistory = [...this.state.systemMessageHistory.slice(-9), message];
        }
        this.io.to(this.state.roomId).emit('system:message', { message, isPersistent });
    };
    /**
     * カードをデッキから引く
     */
    drawCard(deckId, condition, playerId) {
        const [targetLocation, targetState] = condition;
        // デッキから「deck」ロケーションにあるカードを抽出
        const currentDeck = this.state.decks[deckId].filter((c) => c.location === 'deck');
        if (!currentDeck.length)
            return false;
        const card = currentDeck[0];
        card.isFaceUp = targetState === 'face';
        let destination = '';
        server_log('deck', this.state.gameId, this.state.roomId, `DRAW: ${card.name} (ID:${card.id}) (deck -> ${destination}, state: ${targetState})`);
        // A. 捨て札へ
        if (targetLocation === 'discard') {
            card.location = 'discard';
            card.ownerId = null;
            this.state.discardPile[deckId].push(card);
            destination = 'discard';
        }
        // B. プレイヤーの手札へ
        else if (playerId && targetLocation === 'hand') {
            const player = this.state.players.find((p) => p.id === playerId);
            if (player) {
                card.location = 'hand';
                card.ownerId = playerId;
                player.cards.push(card);
                destination = playerId;
            }
        }
        // C. プレイフィールドへ
        else {
            card.location = 'field';
            card.ownerId = null;
            this.state.playFieldCards[deckId].push(card);
            destination = 'field';
        }
        this.emitDeckUpdate(deckId);
        this.emitPlayerUpdate();
        return true;
    }
    /**
     * カードをプレイする
     */
    playCard(data) {
        const { deckId, cardIds, playerId, playLocation = 'field', coordinate } = data;
        const ids = Array.isArray(cardIds) ? cardIds : [cardIds];
        const player = this.state.players.find((p) => p.id === playerId);
        if (player?.isHolding) {
            server_log('card', this.state.gameId, this.state.roomId, `${playerId} はカードをホールドしているので、カードをプレイできません`);
            return;
        }
        ids.forEach((id) => {
            const card = this.state.decks[deckId]?.find((c) => c.id === id);
            if (!card)
                return;
            const p = this.state.players.find((p) => p.id === playerId);
            if (p)
                p.cards = p.cards.filter((c) => c.id !== id);
            card.location = playLocation;
            card.coordinate = coordinate;
            card.isFaceUp = true;
            this.state.playFieldCards[deckId] = this.state.playFieldCards[deckId].filter((c) => c.id !== id);
            this.state.discardPile[deckId] = this.state.discardPile[deckId].filter((c) => c.id !== id);
            if (playLocation === 'discard') {
                this.state.discardPile[deckId].push(card);
            }
            else {
                this.state.playFieldCards[deckId].push(card);
            }
            server_log('card', this.state.gameId, this.state.roomId, `"${card.name}" をプレイした`);
            // カード効果
            const effect = this.param.cardEffects?.[card.name];
            if (effect) {
                server_log('card', this.state.gameId, this.state.roomId, `カード効果発揮: ${card.name} by ${playerId}`);
                effect({
                    playerId,
                    updateResource: (resourceId, amount) => this.acquireResource(playerId, resourceId, amount),
                    updateToken: (tokenId) => this.acquireToken(this.state.roomId, playerId, tokenId),
                });
            }
        });
        // カスタムフック処理
        const onCardPlay = this.param.onCardPlay;
        if (onCardPlay) {
            onCardPlay(this.state, this, data);
        }
        // 更新通知
        this.emitDeckUpdate(deckId);
        this.emitPlayerUpdate();
    }
    /**
     * ホールド状態を解除し、カードを出す
     */
    unholdCards() {
        this.state.players.forEach((player) => {
            player.isHolding = false;
            // プレイヤーがホールドしているデータがない場合はスキップ
            const playerHoldData = this.state.holdCards[player.id];
            if (!playerHoldData)
                return;
            Object.entries(playerHoldData).forEach(([deckId, cardIds]) => {
                const playData = {
                    roomId: this.state.roomId,
                    deckId: deckId,
                    cardIds: cardIds,
                    playerId: player.id,
                    playLocation: 'field',
                    coordinate: { x: 50, y: 50 },
                };
                this.playCard(playData);
            });
            delete this.state.holdCards[player.id];
        });
        server_log('card', this.state.gameId, this.state.roomId, `プレイヤー全員のホールド状態を解除しました`);
    }
    /**
     * フィールドからカードを回収（手札に戻す or 捨て札へ）
     */
    moveFromField(deckId, cardId, playerId) {
        const { playFieldCards, players, discardPile, gameId, roomId } = this.state;
        // 1. フィールドから対象カードを探して抜き取る
        const fieldList = playFieldCards[deckId] || [];
        const cardIndex = fieldList.findIndex((c) => c.id === cardId);
        if (cardIndex === -1)
            return false;
        const [card] = fieldList.splice(cardIndex, 1);
        // 2. 表裏の状態を反映（fieldBackConditionの設定に従う）
        // 以前のロジックを継承：設定が 'face' なら表、それ以外なら裏
        card.isFaceUp = card.fieldBackCondition?.[1] === 'face';
        // 3. 行き先の判定
        if (playerId) {
            // --- 手札に戻す場合 ---
            const player = players.find((p) => p.id === playerId);
            if (!player)
                return false;
            card.location = 'hand';
            card.ownerId = playerId;
            player.cards = player.cards || [];
            player.cards.push(card);
            server_log('card', gameId, roomId, `Return: ${card.name} -> Player:${playerId}`);
        }
        else {
            // --- 捨て札に送る場合 ---
            card.location = 'discard';
            card.ownerId = null;
            discardPile[deckId] = discardPile[deckId] || [];
            discardPile[deckId].push(card);
            server_log('card', gameId, roomId, `Discard: ${card.name} -> discard`);
        }
        this.emitDeckUpdate(deckId);
        this.emitPlayerUpdate();
        return true;
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
            server_log('resource', this.state.gameId, this.state.roomId, `${player.name}: ${resource.name} 更新`);
            this.emitPlayerUpdate();
        }
    };
    /**
     * トークンを取得する
     * @param tokenStoreId - トークン置き場ID
     * @param tokenId - トークンID
     * @param playerId - プレイヤーID
     */
    acquireToken(tokenStoreId, tokenId, playerId) {
        const player = this.state.players.find((p) => p.id === playerId);
        if (!player)
            return;
        const tokens = this.state.tokenStores[tokenStoreId];
        const index = tokens.findIndex((t) => t.id === tokenId);
        if (index !== -1) {
            const acquiredToken = tokens.splice(index, 1)[0];
            if (!Array.isArray(player.tokens)) {
                player.tokens = [];
            }
            player.tokens.push(acquiredToken);
            server_log('token', this.state.gameId, this.state.roomId, `${player.name} (${playerId}) がストア ${tokenStoreId} からトークン ${tokenId} を獲得しました。`);
            this.emitTokenStoreUpdate(tokenStoreId);
        }
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
        server_log('game', this.state.gameId, this.state.roomId, `ターン更新 (Player: ${this.state.players[this.state.currentTurnIndex]?.name}, RoundIndex: ${this.state.currentRoundIndex})`);
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
        server_log('game', this.state.gameId, this.state.roomId, `ラウンド更新 (Player: ${this.state.players[this.state.currentTurnIndex]?.name}, RoundIndex: ${this.state.currentRoundIndex})`);
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
            server_log('game', this.state.gameId, this.state.roomId, `フェーズを更新しました: ${newPhase}`);
            this.io.to(this.state.roomId).emit('game:phase:update', {
                newPhase: this.state.currentPhase,
            });
        }
    }
}
