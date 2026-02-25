import { jsx as _jsx } from "react/jsx-runtime";
import React from 'react';
import cardStyles from './Card.module.css';
export const CardDisplayContent = React.memo(({ card, canSeeFront }) => {
    // 裏向きの場合
    if (!canSeeFront) {
        return (_jsx("div", { className: cardStyles.deckCard, style: {
                backgroundColor: card.backColor || '#333',
                width: '100%',
                height: '100%',
                display: 'block',
                borderRadius: 'inherit', // 親の角丸を引き継ぐ
            } }));
    }
    // 表向き かつ 画像がある場合
    if (card.frontImage) {
        return (_jsx("img", { src: card.frontImage, alt: card.name, className: cardStyles.cardImage, style: {
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block',
                borderRadius: 'inherit',
            } }));
    }
    // 表向き かつ 画像がない場合（名前を表示）
    // ズレを解消するため、背景色（白など）とサイズを固定
    return (_jsx("div", { className: cardStyles.cardNameWrapper, style: {
            backgroundColor: '#ffffff', // 明示的に白を指定して下の色を隠す
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 'inherit',
        }, children: _jsx("strong", { className: cardStyles.cardNameText, children: card.name }) }));
});
