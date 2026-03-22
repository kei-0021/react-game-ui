import { jsx as _jsx } from "react/jsx-runtime";
// src/components/DynamicComponent.tsx
import { Deck } from '../components/Deck.js'; // 順次追加
import { Dice } from '../components/Dice.js';
import { Timer } from '../components/Timer.js'; // 順次追加
export const DynamicComponent = ({ type, props, socket, roomId }) => {
    // 共通の Props をまとめておく
    const commonProps = { socket, roomId };
    switch (type) {
        case 'Dice':
            const processedProps = { ...props };
            if (Array.isArray(props.customFaces)) {
                processedProps.customFaces = props.customFaces.map((src, i) => (_jsx("img", { src: src, style: { width: '100%', height: '100%', objectFit: 'contain' } }, `f${i}`)));
            }
            return _jsx(Dice, { ...commonProps, ...processedProps });
        case 'Timer':
            return _jsx(Timer, { ...commonProps, ...props });
        case 'Deck':
            return _jsx(Deck, { ...commonProps, ...props });
        // 未定義のコンポーネントが来た場合
        default:
            console.warn(`Unknown component type: ${type}`);
            return null;
    }
};
