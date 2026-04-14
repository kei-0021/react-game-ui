import { TokenData } from '@/types/token.js';
import type { DragEvent } from 'react';
import React from 'react';
type TokenProps = {
    token: TokenData;
    style?: React.CSSProperties;
    isFilled?: boolean;
    onClick?: any;
    onDoubleClick?: any;
    isDraggable?: boolean;
    onDragStart?: (e: DragEvent<HTMLDivElement>, token: TokenData) => void;
    onDragEnd?: (e: DragEvent<HTMLDivElement>, token: TokenData) => void;
};
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
export declare const Token: ({ token, style, isFilled, onClick, onDoubleClick, isDraggable, onDragStart, onDragEnd, }: TokenProps) => import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=Token.d.ts.map