import { Socket } from "socket.io-client";
import { PlayerId } from "../types/definition.js";
import { Player } from "../types/player.js";
import type { Resource } from "../types/resource.js";
type PlayerWithResources = Player & {
    resources: Resource[];
};
type ScoreboardProps = {
    socket: Socket;
    players: PlayerWithResources[];
    currentPlayerId?: PlayerId | null;
    myPlayerId: PlayerId | null;
    backColor?: string;
};
export default function ScoreBoard({ socket, players, currentPlayerId, myPlayerId, backColor, }: ScoreboardProps): import("react/jsx-runtime").JSX.Element;
export {};
