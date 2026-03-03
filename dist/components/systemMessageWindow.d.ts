import { RoomId } from '@/types/definition.js';
import React from 'react';
import { Socket } from 'socket.io-client';
interface SystemMessageWindowProps {
    socket: Socket | null;
    roomId: RoomId;
    displayDuration?: number;
}
export declare const SystemMessageWindow: React.FC<SystemMessageWindowProps>;
export {};
//# sourceMappingURL=systemMessageWindow.d.ts.map