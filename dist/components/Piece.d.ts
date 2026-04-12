import { TokenId } from '@/types/definition.js';
import { TokenData } from '@/types/token.js';
import type { DragEvent } from 'react';
import * as React from 'react';
export type PieceProps = {
    piece: TokenData;
    style: React.CSSProperties;
    onClick: (pieceId: TokenId) => void;
    onDoubleClick: (pieceId: TokenId) => void;
    isDraggable: boolean;
    isFilled?: boolean;
    onDragStart: (e: DragEvent<HTMLDivElement>, piece: TokenData) => void;
    onDragEnd: (e: DragEvent<HTMLDivElement>, piece: TokenData) => void;
};
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
export declare function Piece({ piece, style, onClick, onDoubleClick, isDraggable, isFilled, onDragStart, onDragEnd, }: PieceProps): JSX.Element;
//# sourceMappingURL=Piece.d.ts.map