export let LOG_CATEGORIES = {
    connection: true,
    lobby: true,
    game: true,
    room: true,
    deck: true,
    card: true,
    cell: true,
    dice: true,
    timer: true,
    addScore: true,
    resource: true,
    token: true,
    draggable: true,
    warn: true,
    popup: true,
    custom_event: true,
    disconnect: true,
};
const ANSI_RED = '\x1b[31m';
const ANSI_RESET = '\x1b[0m';
export const isExplored = (roomState, position) => {
    return roomState.exploredCells.some((loc) => loc.row === position.row && loc.col === position.col);
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
export const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
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
    static server_log(tag, gameId, roomId, msg) {
        if (!(tag in LOG_CATEGORIES)) {
            throw new Error(`不正なログカテゴリで呼び出されました: ${tag}`);
        }
        if (!LOG_CATEGORIES[tag]) {
            return;
        }
        // 日本時間 (JST) で [HH:mm:ss] を生成
        const time = new Intl.DateTimeFormat('ja-JP', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
            timeZone: 'Asia/Tokyo',
        }).format(new Date());
        const header = `[${time}] [${tag}] [${gameId} (${roomId})]`;
        if (tag === 'warn') {
            console.warn(ANSI_RED + header + ANSI_RESET + ` ${msg}`);
        }
        else {
            console.log(`${header} ${msg}`);
        }
    }
    /**
     * サーバーの実行ログを出力する
     * @param tag - ログのカテゴリ
     * @param gameId - 対象のゲームプリセットID
     * @param roomId - 対象のルームID
     * @param msg - ログのメイン内容
     */
    server_log(tag, msg) {
        RoomManager.server_log(tag, this.state.gameId, this.state.roomId, msg);
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
    shuffleDeck = (deckId) => {
        if (!this.state.decks[deckId])
            return;
        this.server_log('deck', `${deckId} をシャッフル`);
        const currentDeck = this.state.decks[deckId].filter((c) => c.location === 'deck');
        const otherCards = this.state.decks[deckId].filter((c) => c.location !== 'deck');
        for (let i = currentDeck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [currentDeck[i], currentDeck[j]] = [currentDeck[j], currentDeck[i]];
        }
        this.state.decks[deckId] = currentDeck.concat(otherCards);
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
     * ドラッグ可能オブジェクトの更新を通知する
     */
    emitDraggableUpdate = (draggableId) => {
        const updateData = {
            draggableId: draggableId,
            coordinate: this.state.draggable[draggableId].coordinate,
            rotation: this.state.draggable[draggableId].rotation,
            zIndex: this.state.draggable[draggableId].zIndex,
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
        const [targetLocation, targetState] = condition;
        // デッキから「deck」ロケーションにあるカードを抽出
        const currentDeck = this.state.decks[deckId].filter((c) => c.location === 'deck');
        if (!currentDeck.length)
            return false;
        const card = currentDeck[0];
        card.isFaceUp = targetState === 'face';
        let destination = '';
        this.server_log('deck', `DRAW: ${card.name} (ID:${card.id}) (deck -> ${destination}, state: ${targetState})`);
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
            this.server_log('card', `${playerId} はカードをホールドしているので、カードをプレイできません`);
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
            // 最前面に移動
            this.updateZIndex('card', [deckId, card.id], true);
            this.server_log('card', `"${card.name}" をプレイした`);
            // カード効果
            const effect = this.param.cardEffects?.[card.name];
            if (effect) {
                this.server_log('card', `カード効果発揮: ${card.name} by ${playerId}`);
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
        this.server_log('card', `プレイヤー全員のホールド状態を解除しました`);
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
            this.server_log('card', `Return: ${card.name} -> Player:${playerId}`);
        }
        else {
            // --- 捨て札に送る場合 ---
            card.location = 'discard';
            card.ownerId = null;
            discardPile[deckId] = discardPile[deckId] || [];
            discardPile[deckId].push(card);
            this.server_log('card', `Discard: ${card.name} -> discard`);
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
            this.server_log('token', `${player.name} (${playerId}) がストア ${tokenStoreId} からトークン ${acquiredToken.id} を獲得しました。`);
            this.emitTokenStoreUpdate(tokenStoreId);
        }
    }
    /**
     * 特定のセルの探索状態を切り替える
     * @param {Position} position - 操作対象の座標
     * @param {boolean} shouldMark - 探索済みにする場合は true、解除する場合は false
     * @returns {boolean} 状態が実際に変化した場合は true
     */
    updateCellExploredStatus = (position, shouldMark) => {
        const isCurrentlyExplored = isExplored(this.state, position);
        if (shouldMark && !isCurrentlyExplored) {
            this.state.exploredCells.push(position);
            this.server_log('cell', `マス (${position.row}, ${position.col}) を探索済みとしてマークしました。`);
            this.io.to(this.state.roomId).emit('cell:update', this.state.exploredCells);
            return;
        }
        if (!shouldMark && isCurrentlyExplored) {
            this.state.exploredCells = this.state.exploredCells.filter((loc) => !(loc.row === position.row && loc.col === position.col));
            this.server_log('cell', `マス (${position.row}, ${position.col}) の探索済みマークを解除しました。`);
            this.io.to(this.state.roomId).emit('cell:update', this.state.exploredCells);
            return;
        }
        return;
    };
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
    /**
     * セル効果を発動する
     * @param boardId - ボードID
     * @param playerId - 効果を発動させたプレイヤーのID
     * @param position - 発動対象となるマスの座標
     * @param cellEffects - 各セル名に対応する効果処理の定義集
     */
    applyCellEffect = (boardId, playerId, position, cellEffects) => {
        const { row, col } = position;
        // ボード配列を取得
        const targetBoard = this.state.boards[boardId];
        if (!targetBoard) {
            this.server_log('warn', 'applyCellEffect: ボードがありません。');
            return;
        }
        // ID（座標形式）で対象のセルを検索
        const targetId = `r${row}c${col}`;
        const cell = targetBoard.find((c) => c.id === targetId);
        // セルが見つからない場合のガード
        if (!cell) {
            this.server_log('warn', `applyCellEffect: 指定座標にセルが見つかりません。ID: ${targetId}`);
            return;
        }
        const effect = cellEffects[cell.name];
        if (effect) {
            this.server_log('cell', `マス効果発動: ${cell.name} by ${playerId}`);
            try {
                effect(this, playerId);
            }
            catch (e) {
                this.server_log('warn', `マス効果の実行中にエラーが発生しました: ${cell.name}`);
            }
        }
        else {
            this.server_log('cell', `マス効果なし: (${row}, ${col}) ${cell.name}`);
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
                    this.server_log('draggable', `新しいz-index: ${this.state.maxZIndex}`);
                    this.emitDeckUpdate(objectId[0]);
                }
            }
            else {
                if (Array.isArray(objectId)) {
                    throw new Error("Invalid objectId for type 'draggable': expected a string, but received a tuple");
                }
                this.server_log('draggable', 'ドラッグ可能オブジェクトを最前面に移動');
                const draggable = this.state.draggable[objectId];
                if (draggable.zIndex < this.state.maxZIndex) {
                    this.state.maxZIndex++;
                    draggable.zIndex = this.state.maxZIndex;
                    this.server_log('draggable', `新しいz-index: ${this.state.maxZIndex}`);
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
                this.server_log('draggable', `新しいz-index: ${card.zIndex}`);
                this.emitDeckUpdate(objectId[0]);
            }
            else {
                if (Array.isArray(objectId)) {
                    throw new Error("Invalid objectId for type 'draggable': expected a string, but received a tuple");
                }
                this.server_log('draggable', 'ドラッグ可能オブジェクトを最背面に移動');
                const draggable = this.state.draggable[objectId];
                // 100枚規模の衝突を回避する正規化
                draggable.zIndex = 100 + (draggable.zIndex % 100);
                this.server_log('draggable', `新しいz-index: ${draggable.zIndex}`);
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
        this.server_log('game', `ラウンド更新 (Player: ${this.state.players[this.state.currentTurnIndex]?.name}, RoundIndex: ${this.state.currentRoundIndex})`);
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
            this.server_log('game', `フェーズを更新しました: ${newPhase}`);
            this.io.to(this.state.roomId).emit('game:phase:update', {
                newPhase: this.state.currentPhase,
            });
        }
    }
}
