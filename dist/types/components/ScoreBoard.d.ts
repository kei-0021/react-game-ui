import { Socket } from "socket.io-client";
import { Player, PlayerId } from "../types/player.js";
type ScoreboardProps = {
    socket: Socket;
    players: Player[];
    currentPlayerId?: PlayerId | null;
};
export default function ScoreBoard({ socket, players, currentPlayerId }: ScoreboardProps): import("react/jsx-runtime").JSX.Element;
export {};
