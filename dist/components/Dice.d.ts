import { DiceId, RoomId } from '@/types/definition.js';
import { ReactNode } from 'react';
import { Socket } from 'socket.io-client';
type DiceProps = {
    socket?: Socket | null;
    diceId: DiceId;
    roomId: RoomId;
    title?: string;
    sides?: number;
    onRoll?: (value: number) => void;
    customFaces?: ReactNode[];
    tooltipText?: string;
};
export default function Dice({ sides, socket, diceId, roomId, title, onRoll, customFaces, tooltipText, }: DiceProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=Dice.d.ts.map