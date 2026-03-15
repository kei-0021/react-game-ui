import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import styles from './Piece.module.css';
/**
 * ゲーム盤上に配置される個々の駒コンポーネント。
 * @param {PieceData} props.piece - 駒のデータ（ID、名前、画像URL、プレイヤーカラーなど）
 * @param {React.CSSProperties} props.style - 親コンポーネントから渡される絶対配置などのスタイル
 * @param {(pieceId: string) => void} props.onClick - 駒がクリックされた時のハンドラ
 * @param {boolean} props.isDraggable - 駒がドラッグ可能かどうか
 * @param {boolean} [props.isFilled=false] - マスク（着色）モード。trueの場合、画像の線を生かしたままプレイヤーカラーで塗りつぶす
 * @param {(e: DragEvent<HTMLDivElement>, piece: PieceData) => void} props.onDragStart - ドラッグ開始時のハンドラ
 * @param {(e: DragEvent<HTMLDivElement>, piece: PieceData) => void} props.onDragEnd - ドラッグ終了時のハンドラ
 * @returns {JSX.Element} 駒のJSX要素
 */
export function Piece({ piece, style, onClick, isDraggable, isFilled = false, onDragStart, onDragEnd, }) {
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
                e.dataTransfer.setDragImage(e.currentTarget, 45, 45);
            }
            onDragStart(e, piece);
        }
    };
    const pieceClasses = [styles.piece, isDraggable ? styles.draggable : styles.clickable].join(' ');
    // ビルド時の最適化を回避するためのプロパティ名分解
    const MASK_IMAGE_PROP = ['mask', 'Image'].join('');
    const WEBKIT_MASK_IMAGE_PROP = ['Webkit', 'Mask', 'Image'].join('');
    const URL_FUNC = ['u', 'r', 'l'].join('');
    return (_jsx("div", { className: pieceClasses, style: {
            ...style,
            backgroundColor: piece.image ? 'transparent' : piece.color,
            filter: 'none',
            border: 'none',
            outline: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: piece.image ? 'none' : '0 2px 4px rgba(0,0,0,0.2)',
        }, onClick: handleClick, draggable: isDraggable, onDragStart: handleDragStart, onDragEnd: (e) => onDragEnd(e, piece), children: piece.image ? (_jsxs("div", { style: {
                width: '100%',
                height: '100%',
                position: 'relative',
                pointerEvents: 'none',
            }, children: [_jsx("img", { src: piece.image, alt: "", style: {
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        display: 'block',
                    } }), isFilled && (_jsx("div", { style: {
                        position: 'absolute',
                        inset: 0,
                        backgroundColor: piece.color,
                        [WEBKIT_MASK_IMAGE_PROP]: `${URL_FUNC}("${piece.image}")`,
                        [MASK_IMAGE_PROP]: `${URL_FUNC}("${piece.image}")`,
                        WebkitMaskSize: 'contain',
                        maskSize: 'contain',
                        WebkitMaskRepeat: 'no-repeat',
                        maskRepeat: 'no-repeat',
                        WebkitMaskPosition: 'center',
                        maskPosition: 'center',
                        mixBlendMode: 'multiply',
                        pointerEvents: 'none',
                    } }))] })) : (piece.name.substring(0, 1)) }));
}
