import { jsx as _jsx } from "react/jsx-runtime";
import React from 'react';
import cardStyles from './Card.module.css';
import { CardPreview } from './CardPreview.js';
export const CardDisplayContent = React.memo(({ card, canSeeFront, size }) => {
    // 裏向きの場合
    if (!canSeeFront) {
        return (_jsx("div", { className: cardStyles.deckCard, style: { width: size.width, height: size.height, backgroundColor: card.backColor || '#333' } }));
    }
    // 表向き かつ 画像がある場合：背景色を指定しない
    if (card.frontImage) {
        return (_jsx("img", { src: card.frontImage, alt: card.name, className: cardStyles.cardImage, style: { width: size.width, height: size.height } }));
    }
    // 表向き かつ 画像がない場合：白背景のラッパーで名前を表示
    return (_jsx("div", { className: cardStyles.cardNameWrapper, style: { width: size.width, height: size.height }, children: _jsx("strong", { className: cardStyles.cardNameText, children: card.name }) }));
});
export const Card = ({ card, style, isActuallyFreeShape, canSeeFront, onClick, onPointerUp, onPointerDown, onDragStart, isDraggable, size, showPreview, onContextMenu, }) => {
    const [isDragging, setIsDragging] = React.useState(false);
    const handleClick = (e) => {
        e.stopPropagation();
        onClick?.(card.id);
    };
    const handleDragStart = (e) => {
        setIsDragging(true);
        onDragStart?.(e);
    };
    const handleDragEnd = () => {
        setIsDragging(false);
    };
    return (_jsx("div", { className: `${isActuallyFreeShape ? '' : cardStyles.card} ${cardStyles.cardWrapper}`, style: style, onClick: handleClick, onPointerUp: onPointerUp, onPointerDown: onPointerDown, onDragStart: handleDragStart, onDragEnd: handleDragEnd, draggable: isDraggable, onContextMenu: onContextMenu, children: _jsx(CardPreview, { card: card, size: size, disabled: !showPreview || isDragging, children: _jsx(CardDisplayContent, { card: card, canSeeFront: canSeeFront, size: size }) }) }));
};
