import { DiceId, RoomId } from "@/types/definition.js";
import { Socket } from "socket.io-client";
type DiceProps = {
    socket?: Socket | null;
    diceId: DiceId;
    roomId: RoomId;
    sides?: number;
    onRoll?: (value: number) => void;
};
export default function Dice({ sides, socket, diceId, roomId, onRoll }: DiceProps): import("react/jsx-runtime").JSX.Element;
export {};
