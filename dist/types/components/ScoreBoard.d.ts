import { Socket } from "socket.io-client";
import { PlayerId, RoomId } from "../types/definition.js";
import { PlayerWithResources } from "../types/playerWithResources.js";
export default function ScoreBoard({ socket, players, currentPlayerId, myPlayerId, roomId, playCardLimit, autoNextTurnOnCardPlay, }: {
    socket: Socket;
    players: PlayerWithResources[];
    currentPlayerId?: PlayerId | null;
    myPlayerId: PlayerId | null;
    roomId: RoomId;
    playCardLimit?: number;
    autoNextTurnOnCardPlay?: boolean;
}): import("react/jsx-runtime").JSX.Element;
