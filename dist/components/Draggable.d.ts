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
    socket?: Socket;
    roomId?: RoomId;
    draggableId?: DraggableId;
    image?: string;
    mask?: boolean;
    initialX?: number;
    initialY?: number;
    size?: number;
    color?: string;
    isTransparent?: boolean;
    children?: ReactNode;
    style?: CSSProperties;
    onDragEnd?: (x: number, y: number) => void;
    gridBounds?: GridBounds;
    scale?: number;
    containerRef?: React.RefObject<HTMLElement | null>;
};
/**
 * ドラッグ移動と移動のリアルタイムな位置同期機能を提供する
 * @param {Socket} [socket] - リアルタイム同期用のSocket.ioインスタンス
 * @param {RoomId} [roomId] - 同期対象のルームID
 * @param {DraggableId} [draggableId] - この要素を一意に識別するためのID
 * @param {string} [image] - 表示する画像URL
 * @param {boolean} [mask=false] - 画像を背景色(color)でマスク（切り抜き）表示するかどうか
 * @param {number} [initialX=500] - 初期配置のX座標
 * @param {number} [initialY=500] - 初期配置のY座標
 * @param {number} [size=100] - 要素の基本サイズ（幅・高さ共通）
 * @param {string} [color='yellow'] - 背景色またはマスク時の塗りつぶし色
 * @param {boolean} [isTransparent=false] - 背景を透明にするか（colorより優先）
 * @param {ReactNode} [children] - 画像がない場合や、画像の上に重ねて表示するコンテンツ
 * @param {CSSProperties} [style] - 外側から適用する追加のスタイル
 * @param {(x: number, y: number) => void} [onDragEnd] - ドラッグ終了時に確定座標を通知するハンドラ
 * @param {GridBounds} [gridBounds] - スナップ移動を制御するためのグリッド境界情報
 * @param {number} [scale=1] - 親コンテナのズーム倍率（座標計算の補正に使用）
 * @param {React.RefObject<HTMLElement | null>} [containerRef] - 座標計算の基準となる親要素の参照
 */
export declare function Draggable({ image, mask, initialX, initialY, size, color, isTransparent, children, style, socket, roomId, draggableId, onDragEnd, scale, containerRef, }: DraggableProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=Draggable.d.ts.map