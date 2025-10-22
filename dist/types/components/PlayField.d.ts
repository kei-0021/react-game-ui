import { Socket } from "socket.io-client";
import type { DeckId, RoomId } from "../types/definition.js";
import type { PlayerWithResources } from "../types/playerWithResources.js";
type PlayFieldProps = {
    socket: Socket;
    roomId: RoomId;
    deckId: DeckId;
    name: string;
    is_logging?: boolean;
    players: PlayerWithResources[];
    myPlayerId: string | null;
};
export default function PlayField({ socket, roomId, deckId, name, is_logging, players, // Propsからplayersを取得
myPlayerId, }: PlayFieldProps): import("react/jsx-runtime").JSX.Element;
export {};
