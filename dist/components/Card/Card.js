import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import cardStyles from './Card.module.css';
export const CardDisplayContent = React.memo(({ card, canSeeFront }) => {
    // 裏向きの場合
    if (!canSeeFront) {
        return _jsx("div", { className: cardStyles.deckCard, style: { backgroundColor: card.backColor || '#333' } });
    }
    // 表向き かつ 画像がある場合：背景色を指定しない
    if (card.frontImage) {
        return _jsx("img", { src: card.frontImage, alt: card.name, className: cardStyles.cardImage });
    }
    // 表向き かつ 画像がない場合：白背景のラッパーで名前を表示
    return (_jsx("div", { className: cardStyles.cardNameWrapper, children: _jsx("strong", { className: cardStyles.cardNameText, children: card.name }) }));
});
export const Card = ({ card, style, isActuallyFreeShape, canSeeFront, onClick, onPointerUp, onPointerDown, onDragStart, isDraggable, onContextMenu, }) => {
    const handleClick = (e) => {
        e.stopPropagation();
        onClick?.(card.id);
    };
    return (_jsxs("div", { className: `${isActuallyFreeShape ? '' : cardStyles.card} ${cardStyles.cardWrapper}`, style: style, onClick: handleClick, onPointerUp: onPointerUp, onPointerDown: onPointerDown, onDragStart: onDragStart, draggable: isDraggable, onContextMenu: onContextMenu, children: [canSeeFront && card.description && _jsx("span", { className: cardStyles.tooltip, children: card.description }), _jsx(CardDisplayContent, { card: card, canSeeFront: canSeeFront })] }));
};
