import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import styles from './Board.module.css';
/**
 * 盤面を構成する最小単位の「マス（セル）」をレンダリングし、イベントを管理する
 * @template TLocation 位置情報の型定義
 * @param {TLocation} locationData - このセルが保持する位置情報
 * @param {CellData} cellData - 背景色やコンテンツなどの描画用データ
 * @param {boolean} [highlighted=false] - 移動可能範囲として強調表示するかどうか
 * @param {boolean} [changed=false] - 探索済みなどの状態変化（コンテンツの切り替え）を適用するかどうか
 * @param {(loc: TLocation) => void} onClick - クリック時に実行されるコールバック
 * @param {(loc: TLocation) => void} onDoubleClick - ダブルクリック時に実行されるコールバック
 * @param {React.ReactNode} children - セル内に描画される要素
 * @param {(e: React.DragEvent<HTMLDivElement>) => void} onDrop - ドロップ操作時のハンドラ
 * @param {(e: React.DragEvent<HTMLDivElement>) => void} onDragOver - ドラッグ要素が重なった時のハンドラ
 */
export const Cell = ({ locationData, cellData, onClick, onDoubleClick, children, onDrop, onDragOver, highlighted = false, changed = false, }) => {
    const handleClick = () => onClick(locationData);
    const handleDoubleClick = () => onDoubleClick(locationData);
    const effectiveBackgroundColor = changed ? cellData.changedColor : cellData.backgroundColor;
    const cellStyle = {
        backgroundColor: effectiveBackgroundColor,
        position: 'relative',
        overflow: 'hidden',
        userSelect: 'none',
        cursor: highlighted ? 'pointer' : 'default',
    };
    return (_jsxs("div", { className: styles.cell, onClick: handleClick, onDoubleClick: handleDoubleClick, onDrop: onDrop, onDragOver: onDragOver, style: cellStyle, children: [highlighted && (_jsx("div", { style: {
                    position: 'absolute',
                    inset: 0,
                    backgroundColor: 'rgba(20, 184, 166, 0.15)',
                    border: '2px solid rgba(20, 184, 166, 0.4)',
                    boxShadow: 'inset 0 0 12px rgba(20, 184, 166, 0.2)',
                    zIndex: 1,
                    pointerEvents: 'none',
                } })), _jsx("div", { style: { position: 'relative', zIndex: 2, width: '100%', height: '100%' }, children: children })] }));
};
