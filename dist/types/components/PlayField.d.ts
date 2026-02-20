import { Socket } from "socket.io-client";
import type { DeckId, RoomId } from "../types/definition.js";
import type { PlayerWithResources } from "../types/playerWithResources.js";
import "./PlayField.css";
type PlayFieldProps = {
    socket: Socket;
    roomId: RoomId;
    deckId: DeckId;
    name: string;
    is_logging?: boolean;
    players: PlayerWithResources[];
    myPlayerId: string | null;
    layoutMode?: "grid" | "free";
};
export default function PlayField({ socket, roomId, deckId, name, is_logging, players, myPlayerId, layoutMode, }: PlayFieldProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=PlayField.d.ts.map