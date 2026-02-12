import { Socket } from "socket.io-client";
type TimerProps = {
    socket?: Socket | null;
    initialDuration: number;
    onFinish?: () => void;
    roomId?: string;
};
export default function Timer({ socket, initialDuration, onFinish, roomId }: TimerProps): import("react/jsx-runtime").JSX.Element;
export {};
