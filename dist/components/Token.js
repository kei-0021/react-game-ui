import { jsx as _jsx } from "react/jsx-runtime";
import React from 'react';
import styles from './Token.module.css';
export const TokenDisplayContent = React.memo(({ token }) => {
    // 画像がある場合
    if (token.image) {
        return (_jsx("div", { className: styles.contentWrapper, style: { backgroundColor: token.color || '#4f4848ff' }, children: _jsx("img", { src: token.image, alt: token.name, className: styles.image }) }));
    }
    // 画像がない場合
    return (_jsx("div", { className: styles.contentWrapper, style: { backgroundColor: token.color || '#4f4848ff' }, children: _jsx("div", { className: styles.textWrapper, children: _jsx("strong", { className: styles.text, children: token.name }) }) }));
});
