import { DraggableId, RoomId } from '@/types/definition.js';
import type { CSSProperties, ReactNode } from 'react';
import type { Socket } from 'socket.io-client';
interface GridBounds {
    left: number;
    top: number;
    right: number;
    bottom: number;
    cellSize: number;
}
type DraggableProps = {
    socket: Socket;
    roomId: RoomId;
    draggableId: DraggableId;
    image?: string;
    mask?: boolean;
    size?: number | {
        width: number;
        height: number;
    };
    color?: string;
    isTransparent?: boolean;
    zIndex?: number;
    isFrontOnDragging?: boolean;
    children?: ReactNode;
    style?: CSSProperties;
    gridBounds?: GridBounds;
    scale?: number;
    isDebug?: boolean;
    containerRef: React.RefObject<HTMLElement | null>;
};
/**
 * ドラッグ移動と移動のリアルタイムな位置同期機能を提供する
 * @param {Socket} [socket] - リアルタイム同期用のSocket.ioインスタンス
 * @param {RoomId} [roomId] - 同期対象のルームID
 * @param {DraggableId} [draggableId] - この要素を一意に識別するためのID
 * @param {string} [image] - 表示する画像URL
 * @param {boolean} [mask=false] - 画像を背景色(color)でマスク（切り抜き）表示するかどうか
 * @param {number | {width: number, height: number}} [size=100] - 要素のサイズ（数値なら正方形、オブジェクトなら長方形）
 * @param {string} [color='yellow'] - 背景色またはマスク時の塗りつぶし色
 * @param {boolean} [isTransparent=false] - 背景を透明にするか（colorより優先）
 * @param {number} [zIndex=90] - 重なり順。デフォルトは100
 * @param {number} [isFrontOnDragging=false] - ドラッグ中に一時的に zIndex を跳ね上げるためのフラグ
 * @param {ReactNode} [children] - 画像がない場合や、画像の上に重ねて表示するコンテンツ
 * @param {CSSProperties} [style] - 外側から適用する追加のスタイル
 * @param {Coordinate => void} [onDragEnd] - ドラッグ終了時に確定座標を通知するハンドラ
 * @param {GridBounds} [gridBounds] - スナップ移動を制御するためのグリッド境界情報
 * @param {number} [scale=1] - 親コンテナのズーム倍率（座標計算の補正に使用）
 * @param {boolean} [isDebug=false] - z-indexをUI表示するフラグ (デバッグ用)
 * @param {React.RefObject<HTMLElement | null>} [containerRef] - 座標計算の基準となる親要素の参照
 */
export declare function Draggable({ socket, roomId, draggableId, image, mask, size, color, isTransparent, zIndex, isFrontOnDragging, children, style, scale, isDebug, containerRef, }: DraggableProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=Draggable.d.ts.map