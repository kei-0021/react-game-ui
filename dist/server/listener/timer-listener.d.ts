import { GameParam, RoomState } from '@/index.js';
import { GameId, RoomId } from '@/types/definition.js';
import { Server, Socket } from 'socket.io';
export declare function registerTimerListeners(socket: Socket, io: Server, gameParams: Record<GameId, GameParam>, activeRooms: Map<RoomId, RoomState>): void;
//# sourceMappingURL=timer-listener.d.ts.map