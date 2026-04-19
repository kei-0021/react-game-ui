import { RoomState } from '@/index.js';
import { RoomId } from '@/types/definition.js';
import { Server } from 'socket.io';
import type { GameServerOptions } from './server.js';
export declare function initGameServer(io: Server, options: GameServerOptions, activeRooms: Map<RoomId, RoomState>): void;
//# sourceMappingURL=server-logic.d.ts.map