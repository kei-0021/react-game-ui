import { Socket } from "socket.io-client";
import type { DeckId, PlayerId, RoomId } from "../types/definition.js";
type DeckProps = {
    socket: Socket;
    roomId: RoomId;
    deckId: DeckId;
    name: string;
    playerId?: PlayerId | null;
};
export default function Deck({ socket, roomId, deckId, name, playerId }: DeckProps): import("react/jsx-runtime").JSX.Element;
export {};
