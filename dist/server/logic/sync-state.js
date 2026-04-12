/**
 * 準備のできたプレイヤーに対してルームの初期状態を配信する
 * @param state - 初期化済みのルームの状態
 * @param roomManager - 状態更新を扱うクラス
 * @param io - 通信を制御するSocket.IOサーバーインスタンス
 */
export function syncState(state, roomManager, io) {
    // 全ての初期同期をここで実行
    const lastMessage = state.systemMessageHistory.at(-1);
    if (lastMessage)
        roomManager.emitSystemMessage(lastMessage, 0, true);
    // プレイヤー関連
    roomManager.emitPlayerUpdate();
    // デッキ関連
    Object.keys(state.decks).forEach((id) => roomManager.emitDeckUpdate(id));
    // トークン関連
    Object.keys(state.tokenStores).forEach((id) => roomManager.emitTokenStoreUpdate(id));
    // ボード関連
    if (state.exploredCells.length > 0)
        io.to(state.roomId).emit('cell:update', state.exploredCells);
    Object.keys(state.boards).forEach((id) => roomManager.emitBoardUpdate(id));
    // ドラッグ可能オブジェクト関連
    Object.keys(state.draggables).forEach((id) => roomManager.emitDraggableUpdate(id));
    // 初回の一人のみターンを更新する
    if (state.players.length == 1) {
        roomManager.updateRound();
    }
    else {
        io.to(state.roomId).emit('game:turn', {
            currentPlayerId: state.players[state.currentTurnIndex % state.players.length].id,
            currentRoundIndex: state.currentRoundIndex,
            currentTurnIndex: state.currentTurnIndex,
        });
    }
}
