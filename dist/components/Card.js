import { jsx as _jsx } from "react/jsx-runtime";
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
