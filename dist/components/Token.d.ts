import { TokenData } from '@/types/token.js';
import type { DragEvent } from 'react';
type TokenProps = {
    token: TokenData;
    onClick?: any;
    onDoubleClick?: any;
    onDragEnd?: (e: DragEvent<HTMLDivElement>, token: TokenData) => void;
};
export declare const Token: ({ token, onClick, onDoubleClick, onDragEnd }: TokenProps) => import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=Token.d.ts.map