import { jsx as _jsx } from "react/jsx-runtime";
import { Deck } from '../components/Deck.js';
import { Dice } from '../components/Dice.js';
import { Timer } from '../components/Timer.js';
import { Draggable } from './Draggable.js';
import { PlayField } from './PlayField.js';
import { TokenStore } from './TokenStore.js';
export const DynamicComponent = ({ type, props, socket, roomId, myPlayerId, players, containerRef }) => {
    // 共通の Props をまとめておく
    const commonProps = { socket, roomId };
    switch (type) {
        case 'Deck':
            return _jsx(Deck, { ...commonProps, ...props });
        case 'PlayField':
            return _jsx(PlayField, { ...commonProps, ...props, myPlayerId: myPlayerId, players: players });
        case 'TokenStore':
            return _jsx(TokenStore, { ...commonProps, ...props });
        case 'Draggable':
            return _jsx(Draggable, { ...commonProps, ...props, containerRef: containerRef });
        case 'Dice':
            const processedProps = { ...props };
            if (Array.isArray(props.customFaces)) {
                processedProps.customFaces = props.customFaces.map((src, i) => (_jsx("img", { src: src, style: { width: '100%', height: '100%', objectFit: 'contain' } }, `f${i}`)));
            }
            return _jsx(Dice, { ...commonProps, ...processedProps });
        case 'Timer':
            return _jsx(Timer, { ...commonProps, ...props });
        // 未定義のコンポーネントが来た場合
        default:
            console.warn(`Unknown component type: ${type}`);
            return null;
    }
};
