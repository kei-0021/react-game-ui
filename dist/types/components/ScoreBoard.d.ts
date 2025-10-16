import { Socket } from "socket.io-client";
import { PlayerId } from "../types/definition.js";
import { PlayerWithResources } from "../types/playerWithResources.js";
type ScoreboardProps = {
    socket: Socket;
    players: PlayerWithResources[];
    currentPlayerId?: PlayerId | null;
    myPlayerId: PlayerId | null;
    backColor?: string;
};
export default function ScoreBoard({ socket, players, currentPlayerId, myPlayerId, backColor, }: ScoreboardProps): import("react/jsx-runtime").JSX.Element;
export {};
