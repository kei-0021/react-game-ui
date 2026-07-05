import { RoomId } from '@/types/definition.js';
import { Socket } from 'socket.io-client';
interface SystemMessageWindowProps {
    socket: Socket | null;
    roomId: RoomId;
    displayDuration?: number;
}
export declare function SystemMessageWindow({ socket, roomId, displayDuration }: SystemMessageWindowProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=SystemMessageWindow.d.ts.map