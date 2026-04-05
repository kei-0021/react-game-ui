import { GameId, RoomId } from '@/types/definition.js';
import { GameParam, RoomState } from '@/types/server.js';
import { Server, Socket } from 'socket.io';
export declare function registerTokenListeners(socket: Socket, io: Server, gameParams: Record<GameId, GameParam>, activeRooms: Map<RoomId, RoomState>): void;
//# sourceMappingURL=token-listener.d.ts.map