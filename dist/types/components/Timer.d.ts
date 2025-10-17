import { Socket } from "socket.io-client";
type TimerProps = {
    socket?: Socket | null;
    onFinish?: () => void;
    roomId?: string;
};
export default function Timer({ socket, onFinish, roomId }: TimerProps): import("react/jsx-runtime").JSX.Element;
export {};
