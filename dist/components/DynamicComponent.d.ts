import { RoomId } from '@/types/definition.js';
import type { Socket } from 'socket.io-client';
import type { ComponentInfo } from '../types/server.js';
interface DynamicProps {
    type: ComponentInfo['type'];
    props: any;
    socket: Socket;
    roomId: RoomId;
}
export declare const DynamicComponent: ({ type, props, socket, roomId }: DynamicProps) => import("react/jsx-runtime").JSX.Element | null;
export {};
//# sourceMappingURL=DynamicComponent.d.ts.map