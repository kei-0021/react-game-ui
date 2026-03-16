import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useCallback, useEffect, useRef, useState } from 'react';
import draggableStyles from './Draggable.module.css';
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
 * @param {number} [isFrontOnDragging=false] - ドラッグ中に一時的に zIndex を跳ね上げるためのフラグ
 * @param {ReactNode} [children] - 画像がない場合や、画像の上に重ねて表示するコンテンツ
 * @param {CSSProperties} [style] - 外側から適用する追加のスタイル
 * @param {Coordinate => void} [onDragEnd] - ドラッグ終了時に確定座標を通知するハンドラ
 * @param {GridBounds} [gridBounds] - スナップ移動を制御するためのグリッド境界情報
 * @param {number} [scale=1] - 親コンテナのズーム倍率（座標計算の補正に使用）
 * @param {boolean} [isDebug=false] - z-indexをUI表示するフラグ (デバッグ用)
 * @param {React.RefObject<HTMLElement | null>} [containerRef] - 座標計算の基準となる親要素の参照
 */
export function Draggable({ socket, roomId, draggableId, image, mask = false, size = 100, color = 'yellow', isTransparent = false, isFrontOnDragging = false, children, style = {}, scale = 1, isDebug = false, containerRef, }) {
    // 座標と回転、重なり順を内部状態として管理
    const [pos, setPos] = useState({ x: 500, y: 500 });
    const [rotation, setRotation] = useState(0);
    const [currentZ, setCurrentZ] = useState(100);
    // 右クリックメニューの表示状態
    const [contextMenu, setContextMenu] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const posRef = useRef(pos);
    // ドラッグ中かどうかを保持するRef（再レンダリングをトリガーしないようRefで管理）
    const isDraggingRef = useRef(false);
    // サーバーへの同期送信を共通化
    const emitUpdate = useCallback((targetPos, targetRot, targetZ) => {
        if (socket && roomId && draggableId) {
            socket.emit('draggable:moved', {
                roomId: roomId,
                draggableId: draggableId,
                coordinate: targetPos,
                rotation: targetRot,
                zIndex: targetZ,
            });
        }
    }, [socket, roomId, draggableId]);
    useEffect(() => {
        posRef.current = pos;
    }, [pos]);
    // メニュー外クリックで閉じる処理
    useEffect(() => {
        const closeMenu = () => setContextMenu(null);
        if (contextMenu) {
            window.addEventListener('click', closeMenu);
        }
        return () => window.removeEventListener('click', closeMenu);
    }, [contextMenu]);
    useEffect(() => {
        if (!socket || !draggableId)
            return;
        const handleRemoteMove = (data) => {
            // 自分がドラッグ中の時は、サーバーからの座標更新を無視する
            if (data.draggableId === draggableId && !isDraggingRef.current) {
                if (data.coordinate) {
                    setPos({ x: data.coordinate.x, y: data.coordinate.y });
                }
                if (data.rotation !== undefined) {
                    setRotation(data.rotation);
                }
                if (data.zIndex !== undefined) {
                    setCurrentZ(data.zIndex);
                }
            }
        };
        socket.on('draggable:update', handleRemoteMove);
        return () => {
            socket.off('draggable:update', handleRemoteMove);
        };
    }, [socket, draggableId]);
    const handleMouseDown = (e) => {
        // 右クリック(button: 2)時はドラッグを開始しない
        if (e.button !== 0)
            return;
        e.preventDefault();
        // ドラッグ開始
        isDraggingRef.current = true;
        setIsDragging(true);
        const fixedContainer = containerRef?.current;
        if (!fixedContainer)
            return;
        const fixedContainerRect = fixedContainer.getBoundingClientRect();
        const clientX_relative = (e.clientX - fixedContainerRect.left) / scale;
        const clientY_relative = (e.clientY - fixedContainerRect.top) / scale;
        const offsetX = clientX_relative - pos.x;
        const offsetY = clientY_relative - pos.y;
        let lastTime = 0;
        const targetFPS = 60;
        const interval = 1000 / targetFPS;
        const handleMouseMove = (ev) => {
            const now = performance.now();
            if (now - lastTime < interval)
                return;
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
    const handleContextMenu = useCallback((e) => {
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
    const maskStyle = mask && image
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
    const currentZIndex = isFrontOnDragging && isDragging ? 9999 : currentZ;
    const dynamicStyle = {
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
        zIndex: currentZIndex,
        background: mask && image ? undefined : isTransparent ? 'transparent' : color,
        // マスク関連（これも特殊な計算結果なので最後に上書き）
        ...maskStyle,
    };
    return (_jsxs(_Fragment, { children: [_jsx("div", { onMouseDown: handleMouseDown, onContextMenu: handleContextMenu, className: draggableStyles.draggable, style: dynamicStyle, "data-draggable-id": draggableId, children: image ? (_jsx("img", { src: image, alt: "", style: {
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        pointerEvents: 'none',
                        userSelect: 'none',
                        mixBlendMode: mask ? 'multiply' : 'normal',
                    } })) : (children) }), isDebug && (_jsxs("div", { className: draggableStyles.debugLabel, style: {
                    left: `${pos.x}px`,
                    top: `${pos.y - height / 2 - 22}px`,
                    transform: 'translateX(-50%)',
                }, children: ["ID: ", draggableId, " | Z: ", currentZIndex] })), contextMenu && (_jsxs("div", { className: draggableStyles.contextMenu, style: {
                    top: contextMenu.y,
                    left: contextMenu.x,
                }, onClick: (e) => e.stopPropagation(), children: [_jsxs("div", { className: draggableStyles.menuItem, onClick: (e) => {
                            e.stopPropagation();
                            onRotateClick();
                            setContextMenu(null);
                        }, children: [_jsx("span", { className: draggableStyles.menuIcon, children: "\uD83D\uDD04" }), _jsx("span", { children: "90\u5EA6\u56DE\u8EE2" })] }), _jsxs("div", { className: draggableStyles.menuItem, onClick: (e) => {
                            e.stopPropagation();
                            socket.emit('object:bring-to-front', { roomId, objectId: [draggableId], type: 'draggable' });
                            setContextMenu(null);
                        }, children: [_jsx("span", { className: draggableStyles.menuIcon, children: "\u2B06\uFE0F" }), _jsx("span", { children: "\u6700\u524D\u9762\u306B\u79FB\u52D5" })] }), _jsxs("div", { className: draggableStyles.menuItem, onClick: (e) => {
                            e.stopPropagation();
                            onBringToBackClick();
                            setContextMenu(null);
                        }, children: [_jsx("span", { className: draggableStyles.menuIcon, children: "\u2B07\uFE0F" }), _jsx("span", { children: "\u6700\u80CC\u9762\u306B\u79FB\u52D5" })] }), _jsx("div", { className: draggableStyles.separator }), _jsxs("div", { className: draggableStyles.menuItem, onClick: (e) => {
                            e.stopPropagation();
                            const nextRot = 0;
                            setRotation(nextRot);
                            emitUpdate(pos, nextRot, currentZ);
                            setContextMenu(null);
                        }, children: [_jsx("span", { className: draggableStyles.menuIcon, children: "\uD83E\uDDF9" }), _jsx("span", { children: "\u89D2\u5EA6\u3092\u30EA\u30BB\u30C3\u30C8" })] })] }))] }));
}
