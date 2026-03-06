import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import styles from './Token.module.css';
export const TokenDisplayContent = React.memo(({ token }) => {
    if (token.imageSrc) {
        return (_jsxs("div", { className: styles.contentWrapper, children: [_jsx("img", { src: token.imageSrc, alt: token.name, className: styles.image }), ";"] }));
    }
    return (_jsx("div", { className: styles.contentWrapper, children: _jsx("div", { className: styles.textWrapper, children: _jsx("strong", { className: styles.text, children: token.name }) }) }));
});
