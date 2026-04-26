import { CardData } from '@/types/card.js';
import { CardId } from '@/types/definition.js';
import React from 'react';
export declare const CardDisplayContent: React.MemoExoticComponent<({ card, canSeeFront }: {
    card: CardData;
    canSeeFront: boolean;
}) => import("react/jsx-runtime").JSX.Element>;
type CardProps = {
    card: CardData;
    style?: React.CSSProperties;
    isActuallyFreeShape?: boolean;
    canSeeFront: boolean;
    onClick?: (id: CardId) => void;
    onPointerDown?: (e: React.PointerEvent) => void;
    onPointerUp?: (e: React.PointerEvent) => void;
    onDragStart?: React.DragEventHandler<HTMLDivElement>;
    isDraggable?: boolean;
    showPreview?: boolean;
    onContextMenu?: (e: React.MouseEvent) => void;
};
export declare const Card: ({ card, style, isActuallyFreeShape, canSeeFront, onClick, onPointerUp, onPointerDown, onDragStart, isDraggable, showPreview, onContextMenu, }: CardProps) => import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=Card.d.ts.map