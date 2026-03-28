import { Player } from '@/index.js';
import { PlayerId, RoomId } from '@/types/definition.js';
import type { Socket } from 'socket.io-client';
import type { ComponentInfo } from '../types/server.js';
interface DynamicProps {
    type: ComponentInfo['type'];
    props: any;
    socket: Socket;
    roomId: RoomId;
    myPlayerId: PlayerId;
    currentPlayerId: PlayerId;
    players: Player[];
    containerRef: any;
}
export declare const DynamicComponent: ({ type, props, socket, roomId, myPlayerId, currentPlayerId, players, containerRef, }: DynamicProps) => import("react/jsx-runtime").JSX.Element | null;
export {};
//# sourceMappingURL=DynamicComponent.d.ts.map