import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { CardDisplayContent } from './Card.js';
import cardStyles from './Card.module.css';
export const CardPreview = ({ card, children }) => {
    const [isHovered, setIsHovered] = useState(false);
    // 表示する画像も説明もない場合は、ホバー機能を無効化してそのまま返す
    const hasPreview = !!card.frontImage || !!card.description;
    if (!hasPreview) {
        return _jsx(_Fragment, { children: children });
    }
    return (_jsxs("div", { className: cardStyles.previewTrigger, onMouseEnter: () => setIsHovered(true), onMouseLeave: () => setIsHovered(false), children: [children, isHovered && (_jsx("div", { className: cardStyles.previewOverlay, children: _jsxs("div", { className: cardStyles.previewContent, children: [_jsx(CardDisplayContent, { card: card, canSeeFront: true }), card.description && _jsx("p", { className: cardStyles.previewDescription, children: card.description })] }) }))] }));
};
