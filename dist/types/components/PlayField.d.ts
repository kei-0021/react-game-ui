import { Socket } from "socket.io-client";
import { DeckId } from "../types/definition.js";
type PlayFieldProps = {
    socket: Socket;
    deckId: DeckId;
    name: string;
    is_logging?: boolean;
};
export default function PlayField({ socket, deckId, name, is_logging }: PlayFieldProps): import("react/jsx-runtime").JSX.Element;
export {};
