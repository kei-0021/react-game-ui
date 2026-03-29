import type { GameParam, Player, RoomId, RoomState } from '@/index.js';
/**
 * GameParamからRoomStateを作成する
 * @param roomId - ルームID
 * @param param - ゲーム開始時に必要な初期パラメータ
 * @returns 初期化が完了した {@link RoomState} オブジェクト
 */
export declare function createState(roomId: RoomId, param: GameParam): RoomState;
/**
 * GameParamからRoomStateを作成する
 * @param param - ゲーム開始時に必要な初期パラメータ
 * @param state - 初期化済みのルームの状態
 * @param playerName - 新しくルームに参加するプレイヤー名
 * @param socketId - 新しくルームに参加するプレイヤーのソケットID
 * @returns 初期化完了済みのプレイヤーオブジェクト
 */
export declare function createPlayer(param: GameParam, state: RoomState, playerName: string, socketId: string): Player;
//# sourceMappingURL=server-create-state.d.ts.map