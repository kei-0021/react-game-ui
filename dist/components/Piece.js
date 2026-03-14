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
            e.dataTransfer.setData('text/plain', piece.id);
            e.dataTransfer.effectAllowed = 'move';
            onDragStart(e, piece);
        }
    };
    const pieceClasses = [styles.piece, isDraggable ? styles.draggable : styles.clickable].join(' ');
    return (_jsx("div", { className: pieceClasses, style: {
            ...style,
            // 画像がある場合は背景色を透明にするか、画像が丸く切り抜かれるように調整
            backgroundColor: piece.image ? 'transparent' : piece.color,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            overflow: 'hidden', // 画像がはみ出さないように
        }, onClick: handleClick, draggable: isDraggable, onDragStart: handleDragStart, onDragEnd: (e) => onDragEnd(e, piece), children: piece.image ? (_jsx("img", { src: piece.image, alt: piece.name, style: {
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                pointerEvents: 'none',
            } })) : (
        /* 画像がない場合は従来の文字表示 */
        piece.name.substring(0, 1)) }));
}
