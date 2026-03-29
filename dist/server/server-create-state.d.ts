import type { GameParam, RoomId, RoomState } from '@/index.js';
/**
 * GameParamからRoomStateを作成する
 * @param roomId - ルームID
 * @param param - ゲーム開始時に必要な初期パラメータ
 * @returns 初期化が完了した {@link RoomState} オブジェクト
 */
export declare function createState(roomId: RoomId, param: GameParam): RoomState;
//# sourceMappingURL=server-create-state.d.ts.map