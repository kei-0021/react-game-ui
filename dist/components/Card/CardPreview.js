import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { CardDisplayContent } from './Card.js';
import cardPreviewStyles from './CardPreview.module.css';
export const CardPreview = ({ card, children, size, disabled }) => {
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isHovered, setIsHovered] = useState(false);
    const timerRef = useRef(null);
    const hasPreview = !!card.frontImage || !!card.description;
    // プレビューの表示はカーソル侵入から1秒待つ
    const handleMouseEnter = (e) => {
        if (disabled)
            return;
        const { clientX, clientY } = e;
        timerRef.current = setTimeout(() => {
            setIsHovered(true);
            setPosition({ x: clientX, y: clientY });
        }, 1000);
    };
    const handleMouseLeave = () => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
        }
        setIsHovered(false);
    };
    // ドラッグ開始（disabledに変化）した瞬間に表示を消す
    if (disabled && isHovered) {
        handleMouseLeave();
    }
    if (!hasPreview) {
        return _jsx(_Fragment, { children: children });
    }
    return (_jsxs("div", { className: cardPreviewStyles.previewTrigger, onMouseEnter: handleMouseEnter, onMouseLeave: handleMouseLeave, onPointerDown: handleMouseLeave, children: [children, isHovered &&
                !disabled &&
                createPortal(_jsx("div", { className: cardPreviewStyles.previewOverlay, style: { top: `${position.y - 200}px`, left: `${position.x}px` }, children: _jsxs("div", { className: cardPreviewStyles.previewContent, children: [_jsx(CardDisplayContent, { card: card, canSeeFront: true, size: size }), card.description && _jsx("p", { className: cardPreviewStyles.previewDescription, children: card.description })] }) }), document.getElementById('portal-root'))] }));
};
