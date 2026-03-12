import { jsx as _jsx } from "react/jsx-runtime";
import styles from './Board.module.css';
/**
 * 盤面を構成する最小単位の「マス（セル）」をレンダリングし、イベントを管理する
 * @param {TLocation} locationData - このセルが保持する位置情報（ジェネリクス型）
 * @param {CellData} cellData - 背景色やコンテンツなどの描画用データ
 * @param {boolean} [changed=false] - 状態が変化している（ハイライト中）かどうか
 * @param {(loc: TLocation) => void} onClick - クリック時に位置情報を引数として実行されるコールバック
 * @param {(loc: TLocation) => void} onDoubleClick - ダブルクリック時に位置情報を実行するコールバック
 * @param {React.ReactNode} children - セル内に描画される要素（renderCellの結果など）
 * @param {(e: React.DragEvent<HTMLDivElement>) => void} onDrop - ドロップ操作時のハンドラ
 * @param {(e: React.DragEvent<HTMLDivElement>) => void} onDragOver - ドラッグ要素が重なった時のハンドラ
 */
export const Cell = ({ locationData, cellData, onClick, onDoubleClick, children, onDrop, onDragOver, changed = false, }) => {
    const handleClick = () => {
        onClick(locationData);
    };
    const handleDoubleClick = () => {
        onDoubleClick(locationData);
    };
    const effectiveBackgroundColor = changed ? cellData.changedColor : cellData.backgroundColor;
    const cellStyle = {
        backgroundColor: effectiveBackgroundColor,
    };
    return (_jsx("div", { className: styles.cell, onClick: handleClick, onDoubleClick: handleDoubleClick, onDrop: onDrop, onDragOver: onDragOver, style: cellStyle, children: children }));
};
