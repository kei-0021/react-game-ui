import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useEffect, useState } from 'react';
import styles from './RemoteCursor.module.css';
export const RemoteCursor = React.memo(({ socket, roomId, myPlayerId, players, scale, fixedContainerRef, visible, isRelative = true }) => {
    const [remoteCursors, setRemoteCursors] = useState({});
    useEffect(() => {
        if (!socket)
            return;
        const handleUpdate = (data) => {
            if (data.playerId === socket.id || data.playerId === myPlayerId)
                return;
            setRemoteCursors((prev) => ({
                ...prev,
                [data.playerId]: { x: data.x, y: data.y },
            }));
        };
        socket.on('cursor:update', handleUpdate);
        return () => {
            socket.off('cursor:update', handleUpdate);
        };
    }, [socket, myPlayerId]);
    useEffect(() => {
        if (!socket || !roomId || !myPlayerId || !fixedContainerRef.current)
            return;
        const THROTTLE = 50;
        let lastTime = 0;
        const handleMove = (e) => {
            const now = Date.now();
            if (now - lastTime < THROTTLE)
                return;
            lastTime = now;
            const rect = fixedContainerRef.current.getBoundingClientRect();
            const x = isRelative ? (e.clientX - rect.left) / rect.width : (e.clientX - rect.left) / scale;
            const y = isRelative ? (e.clientY - rect.top) / rect.height : (e.clientY - rect.top) / scale;
            socket.emit('cursor:move', {
                roomId,
                playerId: myPlayerId,
                x,
                y,
            });
        };
        window.addEventListener('mousemove', handleMove);
        return () => window.removeEventListener('mousemove', handleMove);
    }, [socket, roomId, myPlayerId, scale, fixedContainerRef, isRelative]);
    if (!visible)
        return null;
    return (_jsx("div", { className: styles.container, children: Object.entries(remoteCursors).map(([id, coords]) => {
            const player = players.find((p) => String(p.socketId) === String(id)) || players.find((p) => p.socketId !== myPlayerId);
            const name = player ? player.name : '接続中...';
            const color = player?.color || '#000000';
            const left = isRelative ? `${coords.x * 100}%` : coords.x;
            const top = isRelative ? `${coords.y * 100}%` : coords.y;
            return (_jsxs("div", { className: styles.cursorWrapper, style: { left, top }, children: [_jsx("div", { className: styles.icon, style: { color: color }, children: "\uD83D\uDC46" }), _jsx("div", { className: styles.label, style: { backgroundColor: color }, children: name })] }, id));
        }) }));
});
