import { Socket } from "socket.io-client";
export type DiceId = string;
type DiceProps = {
    socket?: Socket | null;
    diceId: DiceId;
    sides?: number;
    onRoll?: (value: number) => void;
};
export default function Dice({ sides, socket, diceId, onRoll }: DiceProps): import("react/jsx-runtime").JSX.Element;
export {};
