import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback, useState } from 'react';
export function DropContainer({ scale, containerRef, socket, roomId, componentInfo, gameParam, setComponentInfo, children, }) {
    const [previewSlot, setPreviewSlot] = useState(null);
    const getCanvasCoordinates = useCallback((e) => {
        const canvas = containerRef.current;
        if (!canvas)
            return null;
        const rect = canvas.getBoundingClientRect();
        const x = (e.clientX - rect.left) / scale;
        const y = (e.clientY - rect.top) / scale;
        return {
            x: Math.floor(x / 100) * 100,
            y: Math.floor(y / 100) * 100,
        };
    }, [scale, containerRef]);
    const handleDragOver = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        const coords = getCanvasCoordinates(e);
        if (coords)
            setPreviewSlot(coords);
    }, [getCanvasCoordinates]);
    const handleDrop = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setPreviewSlot(null);
        const rawData = e.dataTransfer.getData('application/react-game-ui');
        if (!rawData || !socket || !roomId || !gameParam)
            return;
        try {
            const data = JSON.parse(rawData);
            const targetId = data.id || data.compId;
            const coords = getCanvasCoordinates(e);
            if (!coords || !targetId)
                return;
            const newComponent = {
                id: targetId,
                type: data.type,
                props: {
                    ...data.props,
                    coordinate: { x: coords.x, y: coords.y },
                },
            };
            const updatedComponents = [...componentInfo, newComponent];
            const newParam = { components: updatedComponents };
            if (data.type === 'Draggable') {
                newParam.draggables = {
                    ...(gameParam.draggables || {}),
                    [targetId]: {
                        id: targetId,
                        coordinate: { x: coords.x, y: coords.y },
                        zIndex: 100,
                        rotation: 0,
                    },
                };
            }
            else if (data.type === 'TokenStore' && data.additionalParams?.initialTokenStores) {
                newParam.initialTokenStores = [
                    ...(gameParam.initialTokenStores || []),
                    ...data.additionalParams.initialTokenStores,
                ];
            }
            else if (data.type === 'Dice') {
                newParam.dice = {
                    [targetId]: { id: targetId, currentValue: 1, sides: 6 },
                };
            }
            socket.emit('game-param:update', {
                gameId: gameParam.gameId,
                newParam: newParam,
            });
            setComponentInfo(updatedComponents);
        }
        catch (err) {
            console.error('Drop error:', err);
        }
    }, [socket, roomId, componentInfo, gameParam, setComponentInfo, getCanvasCoordinates]);
    return (_jsxs("div", { onDragOver: handleDragOver, onDragLeave: () => setPreviewSlot(null), onDrop: handleDrop, style: {
            width: '100%',
            height: '100%',
            position: 'absolute',
            top: 0,
            left: 0,
        }, children: [children, previewSlot && (_jsx("div", { style: {
                    position: 'absolute',
                    left: previewSlot.x,
                    top: previewSlot.y,
                    width: 100,
                    height: 100,
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    border: '2px dashed rgba(255, 255, 255, 0.3)',
                    borderRadius: '8px',
                    pointerEvents: 'none',
                    zIndex: 1000,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }, children: _jsx("span", { style: { fontSize: '24px', opacity: 0.5 }, children: "\uFF0B" }) }))] }));
}
