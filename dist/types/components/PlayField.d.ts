import { Socket } from "socket.io-client";
type PlayFieldProps = {
    socket: Socket;
    deckId: string;
};
export default function PlayField({ socket, deckId }: PlayFieldProps): import("react/jsx-runtime").JSX.Element;
export {};
