import { Socket } from "socket.io-client";
type TimerProps = {
    socket?: Socket | null;
    onFinish?: () => void;
};
export default function Timer({ socket, onFinish }: TimerProps): import("react/jsx-runtime").JSX.Element;
export {};
