import type { PlayerId } from './definition.js';
import type { Phase } from './phase.js';
export type Instruction = {
    type: 'ADD_SCORE';
    playerId: PlayerId | 'ALL';
    points: number;
} | {
    type: 'EMIT_MSG';
    text: string;
    duration?: number;
} | {
    type: 'UPDATE_PHASE';
    newPhase: Phase;
};
//# sourceMappingURL=instruction.d.ts.map