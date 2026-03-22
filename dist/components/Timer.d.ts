import { Socket } from 'socket.io-client';
type TimerProps = {
    socket?: Socket | null;
    roomId?: string;
    initialDuration: number;
    onFinish?: () => void;
};
export declare function Timer({ socket, roomId, initialDuration, onFinish }: TimerProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=Timer.d.ts.map