import { RoomState } from '@/types/server.js';
import { Server } from 'socket.io';
import type { GameServerOptions } from './server.js';
export declare const activeRooms: Map<string, RoomState>;
export declare function initGameServer(io: Server, options: GameServerOptions): void;
//# sourceMappingURL=server-logic.d.ts.map