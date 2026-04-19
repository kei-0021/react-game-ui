import { RoomState } from '@/index.js';
import { Instruction } from '@/types/instruction.js';
import { RoomManager } from './room-manager.js';
/**
 * 型定義を整理（Union型）
 */
type GameLogic = Instruction[] | ((...args: any[]) => any);
/**
 * ゲームの関数・命令セット（Instruction）を解釈し、RoomManagerを介して実行するDSLインタプリタ。
 * @param {GameLogic} logic - 実行する関数・命令セット
 * @param {RoomState} state - 現在のルームの状態。プレイヤー情報やフィールドの状態を参照します。
 * @param {RoomManager} manager - 状態操作を担うマネージャ。点数加算やフェーズ遷移などの実処理を呼び出します。
 */
export declare const roomInterpreter: (logic: GameLogic, state: RoomState, manager: RoomManager, ...args: any[]) => any;
export {};
//# sourceMappingURL=room-interpreter.d.ts.map