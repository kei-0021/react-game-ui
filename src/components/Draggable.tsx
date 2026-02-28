// src/components/Draggable.tsx
import { Coordinate } from '@/types/coodinate.js';
import { DraggableId, RoomId } from '@/types/definition.js';
import { DraggableMovedData, DraggableUpdateData } from '@/types/socketData.js';
import type { CSSProperties, ReactNode } from 'react';
import { useEffect, useRef, useState } from 'react';
import type { Socket } from 'socket.io-client';
import draggableStyles from './Draggable.module.css';

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
  initialXY?: Coordinate;
  /** 要素のサイズ。数値指定時は正方形、オブジェクト指定時は長方形となる */
  size?: number | { width: number; height: number };
  color?: string;
  isTransparent?: boolean;
  children?: ReactNode;
  style?: CSSProperties;
  onDragEnd?: (x: number, y: number) => void;
  gridBounds?: GridBounds;
  scale?: number;
  containerRef: React.RefObject<HTMLElement | null>;
};

/**
 * ドラッグ移動と移動のリアルタイムな位置同期機能を提供する
 * @param {Socket} [socket] - リアルタイム同期用のSocket.ioインスタンス
 * @param {RoomId} [roomId] - 同期対象のルームID
 * @param {DraggableId} [draggableId] - この要素を一意に識別するためのID
 * @param {string} [image] - 表示する画像URL
 * @param {boolean} [mask=false] - 画像を背景色(color)でマスク（切り抜き）表示するかどうか
 * @param {Coordinate} [initialXY={x:500, y:500}] - 初期配置のXY座標
 * @param {number | {width: number, height: number}} [size=100] - 要素のサイズ（数値なら正方形、オブジェクトなら長方形）
 * @param {string} [color='yellow'] - 背景色またはマスク時の塗りつぶし色
 * @param {boolean} [isTransparent=false] - 背景を透明にするか（colorより優先）
 * @param {ReactNode} [children] - 画像がない場合や、画像の上に重ねて表示するコンテンツ
 * @param {CSSProperties} [style] - 外側から適用する追加のスタイル
 * @param {Coordinate => void} [onDragEnd] - ドラッグ終了時に確定座標を通知するハンドラ
 * @param {GridBounds} [gridBounds] - スナップ移動を制御するためのグリッド境界情報
 * @param {number} [scale=1] - 親コンテナのズーム倍率（座標計算の補正に使用）
 * @param {React.RefObject<HTMLElement | null>} [containerRef] - 座標計算の基準となる親要素の参照
 */
export function Draggable({
  socket,
  roomId,
  draggableId,
  initialXY = { x: 500, y: 500 },
  image,
  mask = false,
  size = 100,
  color = 'yellow',
  isTransparent = false,
  children,
  style = {},
  onDragEnd,
  scale = 1,
  containerRef,
}: DraggableProps) {
  const [pos, setPos] = useState(initialXY);
  const [rotation, setRotation] = useState(0);
  const posRef = useRef(pos);
  // ドラッグ中かどうかを保持するRef（再レンダリングをトリガーしないようRefで管理）
  const isDraggingRef = useRef(false);

  useEffect(() => {
    posRef.current = pos;
  }, [pos]);

  useEffect(() => {
    if (!socket || !draggableId) return;
    const handleRemoteMove = (data: DraggableUpdateData) => {
      // 自分がドラッグ中の時は、サーバーからの座標更新を無視する
      if (data.draggableId === draggableId && !isDraggingRef.current) {
        setPos({ x: data.coordinate.x, y: data.coordinate.y });
      }
    };
    socket.on('draggable:update', handleRemoteMove);
    return () => {
      socket.off('draggable:update', handleRemoteMove);
    };
  }, [socket, draggableId]);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();

    // ドラッグ開始
    isDraggingRef.current = true;

    const fixedContainer = containerRef?.current;
    if (!fixedContainer) {
      console.error('containerRef がセットされていません！');
      return;
    }
    const fixedContainerRect = fixedContainer.getBoundingClientRect();
    const clientX_relative = (e.clientX - fixedContainerRect.left) / scale;
    const clientY_relative = (e.clientY - fixedContainerRect.top) / scale;

    const offsetX = clientX_relative - pos.x;
    const offsetY = clientY_relative - pos.y;

    let lastTime = 0;
    const targetFPS = 60; // 50から60へ微調整
    const interval = 1000 / targetFPS;

    const handleMouseMove = (ev: MouseEvent) => {
      const now = performance.now();
      if (now - lastTime < interval) return;
      lastTime = now;

      const currentX_relative = (ev.clientX - fixedContainerRect.left) / scale;
      const currentY_relative = (ev.clientY - fixedContainerRect.top) / scale;

      const newPos = {
        x: currentX_relative - offsetX,
        y: currentY_relative - offsetY,
      };

      setPos(newPos);
      posRef.current = newPos;

      if (socket && roomId && draggableId) {
        const movedData: DraggableMovedData = {
          roomId: roomId,
          draggableId: draggableId,
          coordinate: newPos,
        };
        socket.emit('draggable:moved', movedData);
      }
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);

      const { x, y } = posRef.current;
      if (socket && roomId && draggableId) {
        const movedData: DraggableMovedData = {
          roomId: roomId,
          draggableId: draggableId,
          coordinate: { x: x, y: y },
        };
        socket.emit('draggable:moved', movedData);
      }

      // ドラッグ終了（少し遅らせることで、最後に飛んできた自分の古い座標を捨てる）
      setTimeout(() => {
        isDraggingRef.current = false;
      }, 50);

      onDragEnd?.(x, y);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleDoubleClick = () => setRotation((prev) => prev + 90);

  const MASK_PROP = ['mask', 'Image'].join('');
  const WEBKIT_MASK_PROP = ['Webkit', 'Mask', 'Image'].join('');
  const URL_FUNC = ['u', 'r', 'l'].join('');

  const maskStyle: any =
    mask && image
      ? {
          [WEBKIT_MASK_PROP]: `${URL_FUNC}("${image}")`,
          [MASK_PROP]: `${URL_FUNC}("${image}")`,
          WebkitMaskSize: 'contain',
          maskSize: 'contain',
          WebkitMaskRepeat: 'no-repeat',
          maskRepeat: 'no-repeat',
          WebkitMaskPosition: 'center',
          maskPosition: 'center',
          backgroundColor: color || 'yellow',
        }
      : {};

  // sizeが数値かオブジェクトかによって幅と高さを決定
  const width = typeof size === 'number' ? size : size.width;
  const height = typeof size === 'number' ? size : size.height;

  const dynamicStyle: CSSProperties = {
    left: `${pos.x}px`,
    top: `${pos.y}px`,
    width: `${width}px`,
    height: `${height}px`,
    background: mask && image ? undefined : isTransparent ? 'transparent' : color,
    transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
    position: 'absolute',
    cursor: 'grab',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    ...maskStyle,
    ...style,
  };

  return (
    <div
      onMouseDown={handleMouseDown}
      onDoubleClick={handleDoubleClick}
      className={draggableStyles.draggable}
      style={dynamicStyle}
    >
      {image ? (
        <img
          src={image}
          alt=""
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            pointerEvents: 'none',
            userSelect: 'none',
            mixBlendMode: mask ? 'multiply' : 'normal',
          }}
        />
      ) : (
        children
      )}
    </div>
  );
}
