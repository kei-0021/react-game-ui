import { jsx as _jsx } from "react/jsx-runtime";
import styles from './Board.module.css';
// ----------------------------------------------------
// 💡 修正点: React.FC を使用してコンポーネントを定義
// ----------------------------------------------------
export const Cell = ({ // ⭐ [修正 1]: ジェネリクスをコンポーネント定義時に適用 (Trailing Commaが必要)
locationData, cellData, onClick, onDoubleClick, children, onDrop, onDragOver, changed = false }) => {
    // --------------------------
    // 💡 'All destructured elements are unused' の解消
    // ロジック内で全てのPropsが使われているため、このエラーは解消します。
    // --------------------------
    const handleClick = () => {
        onClick(locationData);
    };
    const handleDoubleClick = () => {
        onDoubleClick(locationData);
    };
    const effectiveBackgroundColor = changed
        ? cellData.changedColor
        : cellData.backgroundColor;
    const cellStyle = {
        backgroundColor: effectiveBackgroundColor,
    };
    return (_jsx("div", { className: styles.cell, onClick: handleClick, onDoubleClick: handleDoubleClick, onDrop: onDrop, onDragOver: onDragOver, style: cellStyle, children: children }));
};
