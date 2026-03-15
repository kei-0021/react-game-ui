// src/components/Draggable.tsx
import { Coordinate } from '@/types/coodinate.js';
import { DraggableId, RoomId } from '@/types/definition.js';
import { DraggableMovedData, DraggableUpdateData } from '@/types/socketData.js';
import type { CSSProperties, ReactNode } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
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
  size?: number | { width: number; height: number };
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
 * @param {Coordinate} [initialXY={x:500, y:500}] - 初期配置のXY座標
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
  zIndex = 100,
  isFrontOnDragging = false,
  children,
  style = {},
  scale = 1,
  isDebug = false,
  containerRef,
}: DraggableProps) {
  // 座標と回転、重なり順を内部状態として管理
  const [pos, setPos] = useState(initialXY);
  const [rotation, setRotation] = useState(0);
  const [currentZ, setCurrentZ] = useState(zIndex);

  // 右クリックメニューの表示状態
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);

  const [isDragging, setIsDragging] = useState(false);
  const posRef = useRef(pos);
  // ドラッグ中かどうかを保持するRef（再レンダリングをトリガーしないようRefで管理）
  const isDraggingRef = useRef(false);

  // サーバーへの同期送信を共通化
  const emitUpdate = useCallback(
    (targetPos: Coordinate, targetRot: number, targetZ: number) => {
      if (socket && roomId && draggableId) {
        socket.emit('draggable:moved', {
          roomId: roomId,
          draggableId: draggableId,
          coordinate: targetPos,
          rotation: targetRot,
          zIndex: targetZ,
        } as DraggableMovedData);
      }
    },
    [socket, roomId, draggableId],
  );

  useEffect(() => {
    posRef.current = pos;
  }, [pos]);

  useEffect(() => {
    setCurrentZ(zIndex);
  }, [zIndex]);

  // メニュー外クリックで閉じる処理
  useEffect(() => {
    const closeMenu = () => setContextMenu(null);
    if (contextMenu) {
      window.addEventListener('click', closeMenu);
    }
    return () => window.removeEventListener('click', closeMenu);
  }, [contextMenu]);

  useEffect(() => {
    if (!socket || !draggableId) return;
    const handleRemoteMove = (data: DraggableUpdateData) => {
      // 自分がドラッグ中の時は、サーバーからの座標更新を無視する
      if (data.draggableId === draggableId && !isDraggingRef.current) {
        setPos({ x: data.coordinate.x, y: data.coordinate.y });
        // 他人からの回転と重なり順の更新を反映
        if (data.rotation !== undefined) setRotation(data.rotation);
        if (data.zIndex !== undefined) setCurrentZ(data.zIndex);
      }
    };
    socket.on('draggable:update', handleRemoteMove);
    return () => {
      socket.off('draggable:update', handleRemoteMove);
    };
  }, [socket, draggableId]);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    // 右クリック(button: 2)時はドラッグを開始しない
    if (e.button !== 0) return;

    e.preventDefault();

    // ドラッグ開始
    isDraggingRef.current = true;
    setIsDragging(true);

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
    const targetFPS = 60;
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

      // 移動中も最新の rotation と currentZ を含めて送信
      emitUpdate(newPos, rotation, currentZ);
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);

      // 最終座標を確定送信
      emitUpdate(posRef.current, rotation, currentZ);

      setIsDragging(false);
      setTimeout(() => {
        isDraggingRef.current = false;
      }, 50);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  /**
   * 右クリックメニューを表示
   */
  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY });
  }, []);

  /**
   * メニューアクション：回転
   */
  const onRotateClick = () => {
    const nextRot = rotation + 90;
    setRotation(nextRot);
    emitUpdate(pos, nextRot, currentZ);
  };

  /**
   * メニューアクション：最前面
   */
  const onBringToFrontClick = () => {
    // 盤面の全Draggableから最大Zを抜き出す
    const allDraggables = document.querySelectorAll(`[data-draggable-id]`);
    const maxZOnBoard = Array.from(allDraggables).reduce((max, el) => {
      const z = parseInt(window.getComputedStyle(el).zIndex);
      return isNaN(z) ? max : Math.max(max, z);
    }, 100);

    // 自分がすでに最大値なら、これ以上加算せず終了する
    if (currentZ >= maxZOnBoard) {
      return;
    }

    // 最大値+1
    const nextZ = maxZOnBoard + 1;

    setCurrentZ(nextZ);
    emitUpdate(pos, rotation, nextZ);
  };

  /**
   * メニューアクション：最背面
   */
  const onBringToBackClick = () => {
    // 100枚規模の衝突を回避する正規化
    const nextZ = 100 + (currentZ % 100);
    setCurrentZ(nextZ);
    emitUpdate(pos, rotation, nextZ);
  };

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

  // ドラッグ中は一時的に 9999、それ以外は currentZ を使用
  const dynamicZIndex = isFrontOnDragging && isDragging ? 9999 : currentZ;

  const dynamicStyle: CSSProperties = {
    position: 'absolute',
    cursor: isDragging ? 'grabbing' : 'grab',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transform: `translate(-50%, -50%) rotate(${rotation}deg)`,

    // まず、外部から渡された汎用的な style を展開
    ...style,

    // 次に、このコンポーネントの専用 Props で上書き（絶対に勝たせる）
    left: `${pos.x}px`,
    top: `${pos.y}px`,
    width: `${width}px`,
    height: `${height}px`,
    zIndex: dynamicZIndex,
    background: mask && image ? undefined : isTransparent ? 'transparent' : color,

    // マスク関連（これも特殊な計算結果なので最後に上書き）
    ...maskStyle,
  };

  return (
    <>
      <div
        onMouseDown={handleMouseDown}
        onContextMenu={handleContextMenu}
        className={draggableStyles.draggable}
        style={dynamicStyle}
        data-draggable-id={draggableId}
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

      {/* デバッグラベルは Draggable の外に配置 */}
      {isDebug && (
        <div
          className={draggableStyles.debugLabel}
          style={{
            left: `${pos.x}px`,
            top: `${pos.y - height / 2 - 22}px`,
            transform: 'translateX(-50%)',
          }}
        >
          ID: {draggableId} | Z: {dynamicZIndex}
        </div>
      )}

      {/* 右クリックメニュー */}
      {contextMenu && (
        <div
          className={draggableStyles.contextMenu}
          style={{
            top: contextMenu.y,
            left: contextMenu.x,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div
            className={draggableStyles.menuItem}
            onClick={(e) => {
              e.stopPropagation();
              onRotateClick();
              setContextMenu(null);
            }}
          >
            <span className={draggableStyles.menuIcon}>🔄</span>
            <span>90度回転</span>
          </div>

          <div
            className={draggableStyles.menuItem}
            onClick={(e) => {
              e.stopPropagation();
              onBringToFrontClick();
              setContextMenu(null);
            }}
          >
            <span className={draggableStyles.menuIcon}>⬆️</span>
            <span>最前面に移動</span>
          </div>

          <div
            className={draggableStyles.menuItem}
            onClick={(e) => {
              e.stopPropagation();
              onBringToBackClick();
              setContextMenu(null);
            }}
          >
            <span className={draggableStyles.menuIcon}>⬇️</span>
            <span>最背面に移動</span>
          </div>

          <div className={draggableStyles.separator} />

          <div
            className={draggableStyles.menuItem}
            onClick={(e) => {
              e.stopPropagation();
              const nextRot = 0;
              setRotation(nextRot);
              emitUpdate(pos, nextRot, currentZ);
              setContextMenu(null);
            }}
          >
            <span className={draggableStyles.menuIcon}>🧹</span>
            <span>角度をリセット</span>
          </div>
        </div>
      )}
    </>
  );
}
