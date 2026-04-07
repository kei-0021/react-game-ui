// src/server/room-interpreter.ts
export const roomInterpreter = (instructions, state, manager) => {
    const instList = Array.isArray(instructions) ? instructions : [instructions];
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
            default:
                console.warn(`未定義の命令です: ${inst.type}`);
        }
    });
};
