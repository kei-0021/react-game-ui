import { jsx as _jsx } from "react/jsx-runtime";
import React from 'react';
import styles from './Token.module.css';
const TokenDisplayContent = React.memo(({ token }) => {
    // 画像がある場合
    if (token.image) {
        return (_jsx("div", { className: styles.contentWrapper, style: { backgroundColor: token.color || '#4f4848ff' }, children: _jsx("img", { src: token.image, alt: token.name, className: styles.image }) }));
    }
    // 画像がない場合
    return (_jsx("div", { className: styles.contentWrapper, style: { backgroundColor: token.color || '#4f4848ff' }, children: _jsx("div", { className: styles.textWrapper, children: _jsx("strong", { className: styles.text, children: token.name }) }) }));
});
export const Token = ({ token, style, onClick, onDoubleClick, isDraggable, onDragStart, onDragEnd }) => {
    const handleClick = (e) => {
        e.stopPropagation();
        onClick(token.id);
    };
    const handleDoubleClick = (e) => {
        e.stopPropagation();
        onDoubleClick(token.id);
    };
    const handleDragStart = (e) => {
        if (isDraggable) {
            e.stopPropagation();
            e.dataTransfer.setData('pieceId', token.id);
            e.dataTransfer.effectAllowed = 'move';
            if (token.image) {
                e.dataTransfer.setDragImage(e.currentTarget, 45, 45);
            }
            onDragStart?.(e, token);
        }
    };
    const handleDragEnd = (e) => {
        onDragEnd?.(e, token);
    };
    return (_jsx("div", { className: styles.tokenContainer, style: {
            ...style,
        }, onClick: handleClick, onDoubleClick: handleDoubleClick, draggable: true, onDragStart: handleDragStart, onDragEnd: handleDragEnd, children: _jsx(TokenDisplayContent, { token: token }) }));
};
