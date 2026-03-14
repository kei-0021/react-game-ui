import { jsx as _jsx } from "react/jsx-runtime";
import styles from './Piece.module.css';
export function Piece({ piece, style, onClick, isDraggable, onDragStart, onDragEnd }) {
    const handleClick = (e) => {
        e.stopPropagation();
        onClick(piece.id);
    };
    const handleDragStart = (e) => {
        if (isDraggable) {
            e.stopPropagation();
            e.dataTransfer.setData('pieceId', piece.id);
            e.dataTransfer.effectAllowed = 'move';
            if (piece.image) {
                e.dataTransfer.setDragImage(e.currentTarget, 45, 45); // 駒の中心（90pxの半分）を指定
            }
            onDragStart(e, piece);
        }
    };
    const pieceClasses = [styles.piece, isDraggable ? styles.draggable : styles.clickable].join(' ');
    const imageStyle = piece.image
        ? {
            WebkitMaskImage: `url("${piece.image}")`,
            maskImage: `url("${piece.image}")`,
            WebkitMaskSize: 'contain',
            maskSize: 'contain',
            WebkitMaskRepeat: 'no-repeat',
            maskRepeat: 'no-repeat',
            WebkitMaskPosition: 'center',
            maskPosition: 'center',
            backgroundColor: 'transparent',
            borderRadius: '0',
            filter: `drop-shadow(1px 0 0 ${piece.color}) drop-shadow(-1px 0 0 ${piece.color}) drop-shadow(0 1px 0 ${piece.color}) drop-shadow(0 -1px 0 ${piece.color})`,
        }
        : {
            backgroundColor: piece.color,
        };
    return (_jsx("div", { className: pieceClasses, style: {
            ...style,
            ...imageStyle,
            // none や 0 にせず、透明にすることで描画領域を確保し、縁取りを維持する
            borderColor: piece.image ? 'transparent' : undefined,
            boxShadow: piece.image ? 'none' : undefined,
            filter: piece.image
                ? `drop-shadow(1px 0 0 ${piece.color}) drop-shadow(-1px 0 0 ${piece.color}) drop-shadow(0 1px 0 ${piece.color}) drop-shadow(0 -1px 0 ${piece.color})`
                : undefined,
        }, onClick: handleClick, draggable: isDraggable, onDragStart: handleDragStart, onDragEnd: (e) => onDragEnd(e, piece), children: piece.image ? (_jsx("img", { src: piece.image, alt: "", style: {
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                pointerEvents: 'none',
            } })) : (piece.name.substring(0, 1)) }));
}
