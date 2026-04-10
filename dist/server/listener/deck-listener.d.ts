import { GameParam, RoomState } from '@/index.js';
import { GameId, RoomId } from '@/types/definition.js';
import { Server, Socket } from 'socket.io';
/**
 * デッキ・カード操作専用のイベントリスナーを登録する。
 * 山札からのドロー、フィールドへのプレイ、カードの反転（フリップ）など、
 * プレイヤー対戦の核となるアクションを制御する。
 */
export declare function registerDeckListeners(socket: Socket, io: Server, gameParams: Record<GameId, GameParam>, activeRooms: Map<RoomId, RoomState>): void;
//# sourceMappingURL=deck-listener.d.ts.map