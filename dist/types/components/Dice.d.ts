import { Socket } from "socket.io-client";
import { DiceId } from "../types/definition.js";
type DiceProps = {
    socket?: Socket | null;
    diceId: DiceId;
    sides?: number;
    onRoll?: (value: number) => void;
};
export default function Dice({ sides, socket, diceId, onRoll }: DiceProps): import("react/jsx-runtime").JSX.Element;
export {};
