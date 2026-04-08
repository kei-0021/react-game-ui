// src/server/room-interpreter.ts
/**
 * ゲームの関数・命令セット（Instruction）を解釈し、RoomManagerを介して実行するDSLインタプリタ。
 * @param {GameLogic} logic - 実行する関数・命令セット
 * @param {RoomState} state - 現在のルームの状態。プレイヤー情報やフィールドの状態を参照します。
 * @param {RoomManager} manager - 状態操作を担うマネージャ。点数加算やフェーズ遷移などの実処理を呼び出します。
 */
export const roomInterpreter = (logic, state, manager, ...args) => {
    // 関数の場合
    if (typeof logic === 'function') {
        return logic(state, manager, ...args);
    }
    // データの場合
    const instList = Array.isArray(logic) ? logic : [logic];
    instList.forEach((inst) => {
        switch (inst.type) {
            case 'ADD_SCORE':
                if (inst.playerId === 'ALL') {
                    state.players.forEach((p) => manager.addScore(p.id, inst.points));
                }
                else {
                    manager.addScore(inst.playerId, inst.points);
                }
                break;
            case 'EMIT_MSG':
                manager.emitSystemMessage(inst.text, inst.duration ?? 1000, true);
                break;
            case 'UPDATE_PHASE':
                manager.updatePhase(inst.newPhase);
                break;
            default:
                console.warn(`未定義の命令です: ${inst.type}`);
        }
    });
};
