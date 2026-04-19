import { GameParam, RoomState } from '@/index.js';
import { GameId, RoomId } from '@/types/definition.js';
import { Server, Socket } from 'socket.io';
export declare function registerRoomListeners(socket: Socket, io: Server, gameParams: Record<GameId, GameParam>, activeRooms: Map<RoomId, RoomState>): void;
//# sourceMappingURL=room-listener.d.ts.map