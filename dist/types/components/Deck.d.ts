import { Socket } from "socket.io-client";
import type { DeckId, PlayerId } from "../types/definition.js";
type DeckProps = {
    socket: Socket;
    deckId: DeckId;
    name: string;
    playerId?: PlayerId | null;
};
export default function Deck({ socket, deckId, name, playerId }: DeckProps): import("react/jsx-runtime").JSX.Element;
export {};
