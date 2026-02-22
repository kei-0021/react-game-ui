import { jsx as _jsx } from "react/jsx-runtime";
import styles from './Piece.module.css';
// 戻り値の型も明示
export default function Piece({ piece, style, onClick, isDraggable, onDragStart }) {
    const handleClick = (e) => {
        e.stopPropagation();
        onClick(piece.id);
    };
    // ⭐ [修正] 標準の onDragStart イベントハンドラ
    const handleDragStart = (e) => {
        if (isDraggable) {
            e.stopPropagation();
            // 必須: ドラッグが開始されたときに、ドラッグするデータをセットする
            e.dataTransfer.setData('text/plain', piece.id);
            e.dataTransfer.effectAllowed = 'move';
            // 親（Board.tsx）から渡されたハンドラを実行
            onDragStart(e, piece);
        }
    };
    const pieceClasses = [
        styles.piece,
        isDraggable ? styles.draggable : styles.clickable
    ].join(' ');
    return (_jsx("div", { className: pieceClasses, style: {
            ...style,
            backgroundColor: piece.color,
        }, onClick: handleClick, 
        // ⭐ [追加] HTMLの draggable 属性を設定
        draggable: isDraggable, 
        // ⭐ [修正] 標準の onDragStart イベントハンドラを設定
        onDragStart: handleDragStart, 
        // 🚨 onMouseDown/onTouchStart のカスタムドラッグ処理は削除。
        //    draggable="true"とonDragStartで十分です。
        title: piece.name, children: piece.name.substring(0, 1) }));
}
