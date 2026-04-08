import { RoomState } from '@/index.js';
import { PlayerId } from '@/types/definition.js';
import { Phase } from '@/types/phase.js';
import { RoomManager } from './room-manager.js';
type Instruction = {
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
/**
 * ゲームの命令セット（Instruction）を解釈し、RoomManagerを介して実行するDSLインタプリタ。
 * @param {Instruction[]} instructions - 実行する命令オブジェクトの配列。
 * @param {RoomState} state - 現在のルームの状態。プレイヤー情報やフィールドの状態を参照します。
 * @param {RoomManager} manager - 状態操作を担うマネージャ。点数加算やフェーズ遷移などの実処理を呼び出します。
 */
export declare const roomInterpreter: (instructions: Instruction[], state: RoomState, manager: RoomManager) => void;
export {};
//# sourceMappingURL=room-interpreter.d.ts.map