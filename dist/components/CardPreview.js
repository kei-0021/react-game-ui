import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useRef, useState } from 'react';
import { CardDisplayContent } from './Card.js';
import cardStyles from './Card.module.css';
export const CardPreview = ({ card, children }) => {
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isHovered, setIsHovered] = useState(false);
    const timerRef = useRef(null);
    const hasPreview = !!card.frontImage || !!card.description;
    // プレビューの表示はカーソル侵入から0.5秒待つ
    const handleMouseEnter = (e) => {
        timerRef.current = setTimeout(() => {
            setPosition({ x: e.clientX, y: e.clientY - 180 });
            setIsHovered(true);
        }, 500);
    };
    const handleMouseLeave = () => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
        }
        setIsHovered(false);
    };
    if (!hasPreview) {
        return _jsx(_Fragment, { children: children });
    }
    return (_jsxs("div", { className: cardStyles.previewTrigger, onMouseEnter: handleMouseEnter, onMouseLeave: handleMouseLeave, children: [children, isHovered && (_jsx("div", { className: cardStyles.previewOverlay, style: { top: `${position.y}px`, left: `${position.x}px` }, children: _jsxs("div", { className: cardStyles.previewContent, children: [_jsx(CardDisplayContent, { card: card, canSeeFront: true }), card.description && _jsx("p", { className: cardStyles.previewDescription, children: card.description })] }) }))] }));
};
