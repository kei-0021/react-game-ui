import { jsx as _jsx } from "react/jsx-runtime";
// src/dynamic/DynamicComponent.tsx
import { GridBoard, ScoreBoard, SystemMessageWindow } from '@/index.js';
import { useEffect, useMemo } from 'react';
import { Deck } from '../components/Deck.js';
import { Dice } from '../components/Dice.js';
import { Draggable } from '../components/Draggable.js';
import { PlayField } from '../components/PlayField.js';
import { Timer } from '../components/Timer.js';
import { TokenStore } from '../components/TokenStore.js';
export const DynamicComponent = ({ type, props, socket, roomId, myPlayerId, currentPlayerId, players, containerRef, }) => {
    useEffect(() => {
        console.log('DynamicComponent: mount', props);
        return () => console.log('DynamicComponent: unmount', props);
    }, []);
    // 共通の Props をまとめておく
    const commonProps = { socket, roomId };
    // 外側のスロット（Dynamicレイヤー）としての動的スタイル計算
    const dynamicStyle = useMemo(() => {
        const baseStyle = {
            position: props.coordinate ? 'absolute' : 'relative',
            left: props.coordinate?.x,
            top: props.coordinate?.y,
            zIndex: props.zIndex ?? 1,
            transition: 'all 0.2s ease-out',
            gridColumn: props.slotX ? `${props.slotX}` : undefined,
            gridRow: props.slotY ? `${props.slotY}` : undefined,
        };
        // スロット配置用のCSS（GridやFlexを動的に適用）
        if (props.isSlot) {
            return {
                ...baseStyle,
                display: 'grid',
                gridTemplateColumns: `repeat(${props.cols || 1}, 1fr)`,
                gap: `${props.gap || 0}px`,
                padding: `${props.padding || 0}px`,
                alignItems: 'center',
                justifyContent: 'center',
            };
        }
        return baseStyle;
    }, [props.coordinate, props.zIndex, props.isSlot, props.cols, props.gap, props.padding, props.slotX, props.slotY]);
    // 実体（CoreComponent）のレンダリング
    const renderCore = () => {
        switch (type) {
            case 'Deck':
                return _jsx(Deck, { ...commonProps, ...props, myPlayerId: myPlayerId, currentPlayerId: currentPlayerId });
            case 'PlayField':
                return _jsx(PlayField, { ...commonProps, ...props, myPlayerId: myPlayerId, players: players, isDebug: true });
            case 'ScoreBoard':
                return (_jsx(ScoreBoard, { ...commonProps, ...props, myPlayerId: myPlayerId, currentPlayerId: currentPlayerId, players: players }));
            case 'TokenStore':
                return _jsx(TokenStore, { ...commonProps, ...props });
            case 'GridBoard':
                return _jsx(GridBoard, { ...commonProps, ...props });
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
            case 'SystemMessageWindow':
                return _jsx(SystemMessageWindow, { ...commonProps });
            // 未定義のコンポーネントが来た場合
            default:
                console.warn(`Unknown component type: ${type}`);
                return null;
        }
    };
    return (_jsx("div", { className: "dynamic-wrapper", style: dynamicStyle, children: renderCore() }));
};
