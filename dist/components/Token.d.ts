import { TokenData } from '@/types/token.js';
import type { DragEvent } from 'react';
import React from 'react';
type TokenProps = {
    token: TokenData;
    style?: React.CSSProperties;
    onClick?: any;
    onDoubleClick?: any;
    isDraggable?: boolean;
    onDragStart?: any;
    onDragEnd?: (e: DragEvent<HTMLDivElement>, token: TokenData) => void;
};
export declare const Token: ({ token, style, onClick, onDoubleClick, isDraggable, onDragStart, onDragEnd }: TokenProps) => import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=Token.d.ts.map