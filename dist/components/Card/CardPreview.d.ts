import { CardData } from '@/types/card.js';
import React from 'react';
type CardPreviewProps = {
    card: CardData;
    children: React.ReactNode;
    size: {
        width: number;
        height: number;
    };
    disabled?: boolean;
};
export declare const CardPreview: ({ card, children, size, disabled }: CardPreviewProps) => import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=CardPreview.d.ts.map