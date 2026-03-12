import { jsx as _jsx } from "react/jsx-runtime";
import styles from './Piece.module.css';
// 戻り値の型も明示
export function Piece({ piece, style, onClick, isDraggable, onDragStart }) {
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
            backgroundColor: piece.color,
        }, onClick: handleClick, draggable: isDraggable, onDragStart: handleDragStart, title: piece.name, children: piece.name.substring(0, 1) }));
}
