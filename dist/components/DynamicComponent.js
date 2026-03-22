import { jsx as _jsx } from "react/jsx-runtime";
// src/components/DynamicComponent.tsx
import { Dice } from '../components/Dice.js';
export const DynamicComponent = ({ type, props, socket, roomId }) => {
    if (type === 'Dice') {
        return _jsx(Dice, { socket: socket, roomId: roomId, ...props });
    }
    return null;
};
