import { PlayerId } from '@/types/definition.js';
import { RoomState } from '@/types/server.js';
import { RoomManager } from './room-manager.js';
type Instruction = {
    type: 'ADD_SCORE';
    playerId: PlayerId | 'ALL';
    points: number;
} | {
    type: 'EMIT_MSG';
    text: string;
    duration?: number;
};
export declare const roomInterpreter: (instructions: Instruction[], state: RoomState, manager: RoomManager) => void;
export {};
//# sourceMappingURL=room-interpreter.d.ts.map