import { RoomState } from '@/index.js';
import { Server } from 'socket.io';
import { RoomManager } from '../room-manager.js';
/**
 * 準備のできたプレイヤーに対してルームの状態を配信する
 * @param state - 初期化済みのルームの状態
 * @param roomManager - 状態更新を扱うクラス
 * @param io - 通信を制御するSocket.IOサーバーインスタンス
 */
export declare function syncState(state: RoomState, roomManager: RoomManager, io: Server): void;
//# sourceMappingURL=sync-state.d.ts.map