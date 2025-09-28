import { Socket } from "socket.io-client";
import type { DeckId } from "../types/card.js";
import { PlayerId } from "../types/player.js";
type DeckProps = {
    socket: Socket;
    deckId: DeckId;
    name: string;
    playerId?: PlayerId | null;
};
export default function Deck({ socket, deckId, name, playerId }: DeckProps): import("react/jsx-runtime").JSX.Element;
export {};
