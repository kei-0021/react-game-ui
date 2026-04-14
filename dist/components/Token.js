import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import styles from './Token.module.css';
const TokenDisplayContent = React.memo(({ token, isFilled }) => {
    // 画像がない場合
    if (!token.image) {
        return (_jsx("div", { className: styles.contentWrapper, style: { backgroundColor: token.color || '#4f4848ff' }, children: _jsx("div", { className: styles.textWrapper, children: _jsx("strong", { className: styles.text, children: token.name }) }) }));
    }
    // ビルド時の最適化回避用
    const MASK_IMAGE_PROP = ['mask', 'Image'].join('');
    const WEBKIT_MASK_IMAGE_PROP = ['Webkit', 'Mask', 'Image'].join('');
    const URL_FUNC = ['u', 'r', 'l'].join('');
    // 画像がある場合
    return (_jsxs("div", { className: styles.contentWrapper, style: { backgroundColor: '#4f4848ff', overflow: 'hidden' }, children: [_jsx("img", { src: token.image, alt: token.name, className: styles.image }), isFilled && (_jsx("div", { style: {
                    position: 'absolute',
                    inset: 0,
                    backgroundColor: token.color || 'red',
                    [WEBKIT_MASK_IMAGE_PROP]: `${URL_FUNC}("${token.image}")`,
                    [MASK_IMAGE_PROP]: `${URL_FUNC}("${token.image}")`,
                    WebkitMaskSize: 'contain',
                    maskSize: 'contain',
                    WebkitMaskRepeat: 'no-repeat',
                    maskRepeat: 'no-repeat',
                    WebkitMaskPosition: 'center',
                    maskPosition: 'center',
                    mixBlendMode: 'multiply',
                    pointerEvents: 'none',
                } }))] }));
});
/**
 * トークンを表すコンポーネント。
 * @param {PieceData} token - トークンのデータ
 * @param {React.CSSProperties} style - 親コンポーネントから渡される絶対配置などのスタイル
 * @param {boolean} [props.isFilled=false] - マスク（着色）モード。trueの場合、画像の線を生かしたままプレイヤーカラーで塗りつぶす
 * @param {(pieceId: string) => void} onClick - 駒がクリックされた時のハンドラ
 * @param {boolean} isDraggable - ドラッグ可能かどうか
 * @param {(e: DragEvent<HTMLDivElement>, piece: PieceData) => void} onDragStart - ドラッグ開始時のハンドラ
 * @param {(e: DragEvent<HTMLDivElement>, piece: PieceData) => void} onDragEnd - ドラッグ終了時のハンドラ
 * @returns {JSX.Element} 駒のJSX要素
 */
export const Token = ({ token, style, isFilled = false, onClick, onDoubleClick, isDraggable, onDragStart, onDragEnd, }) => {
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
            e.dataTransfer.setData('tokenId', token.id);
            e.dataTransfer.effectAllowed = 'move';
            onDragStart?.(e, token);
        }
    };
    const handleDragEnd = (e) => {
        onDragEnd?.(e, token);
    };
    return (_jsx("div", { className: styles.tokenContainer, style: {
            ...style,
        }, onClick: handleClick, onDoubleClick: handleDoubleClick, draggable: isDraggable, onDragStart: handleDragStart, onDragEnd: handleDragEnd, children: _jsx(TokenDisplayContent, { token: token, isFilled: isFilled }) }));
};
