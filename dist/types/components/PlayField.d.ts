import { Socket } from "socket.io-client";
import type { DeckId, RoomId } from "../types/definition.js";
type PlayFieldProps = {
    socket: Socket;
    roomId: RoomId;
    deckId: DeckId;
    name: string;
    is_logging?: boolean;
};
export default function PlayField({ socket, roomId, deckId, name, is_logging, }: PlayFieldProps): import("react/jsx-runtime").JSX.Element;
export {};
