import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import * as React from 'react';
import { client_log } from '../utils/client-log.js';
import { CardDisplayContent } from './Card.js';
import cardStyles from './Card.module.css';
import './PlayField.css';
// 通信量制限用の throttle
function throttle(func, limit) {
    let inThrottle;
    return function (...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => (inThrottle = false), limit);
        }
    };
}
export function PlayField({ socket, roomId, deckId, title, players, myPlayerId, layoutMode = 'free', is_logging = false, backgroundImage, }) {
    const [playedCards, setPlayedCards] = React.useState([]);
    const [activeDraggingId, setActiveDraggingId] = React.useState(null);
    const containerRef = React.useRef(null);
    const draggingIdRef = React.useRef(null);
    React.useEffect(() => {
        socket.on(`deck:update:${roomId}:${deckId}`, (data) => {
            const newCards = data.playFieldCards || [];
            if (is_logging) {
                client_log('playField', `[${deckId}] 場の更新: ${newCards.length}枚`);
            }
            setPlayedCards(newCards);
        });
        return () => {
            socket.off(`deck:update:${roomId}:${deckId}`);
        };
    }, [socket, roomId, deckId, is_logging]);
    // リアルタイム送信ロジック（境界制限付き）
    const emitMove = React.useMemo(() => throttle((cardId, clientX, clientY) => {
        if (!containerRef.current)
            return;
        const rect = containerRef.current.getBoundingClientRect();
        // 座標計算 & 0-100% の範囲にクランプ
        let x = ((clientX - rect.left) / rect.width) * 100;
        let y = ((clientY - rect.top) / rect.height) * 100;
        x = Math.max(0, Math.min(100, x));
        y = Math.max(0, Math.min(100, y));
        socket.emit('card:move-on-field', {
            roomId,
            deckId,
            cardId,
            coordinate: { x, y },
        });
    }, 50), [socket, roomId, deckId]);
    const handlePointerDown = (e, card) => {
        if (layoutMode !== 'free')
            return;
        draggingIdRef.current = card.id;
        setActiveDraggingId(card.id);
        e.currentTarget.setPointerCapture(e.pointerId);
    };
    const handlePointerMove = (e) => {
        if (!draggingIdRef.current)
            return;
        emitMove(draggingIdRef.current, e.clientX, e.clientY);
    };
    const handlePointerUp = (e) => {
        if (!draggingIdRef.current)
            return;
        emitMove(draggingIdRef.current, e.clientX, e.clientY);
        e.currentTarget.releasePointerCapture(e.pointerId);
        draggingIdRef.current = null;
        setActiveDraggingId(null);
    };
    // --- 手札（ScoreBoard）からの新規ドロップ受け入れ ---
    const handleDrop = (e) => {
        e.preventDefault();
        if (!containerRef.current || !myPlayerId)
            return;
        const droppedCardId = e.dataTransfer.getData('cardId');
        const droppedDeckId = e.dataTransfer.getData('deckId');
        if (!droppedCardId || !droppedDeckId)
            return;
        const rect = containerRef.current.getBoundingClientRect();
        let x = ((e.clientX - rect.left) / rect.width) * 100;
        let y = ((e.clientY - rect.top) / rect.height) * 100;
        x = Math.max(0, Math.min(100, x));
        y = Math.max(0, Math.min(100, y));
        const playData = {
            roomId,
            deckId: droppedDeckId,
            cardIds: [droppedCardId],
            playerId: myPlayerId,
            playLocation: 'field',
            coordinate: { x, y },
        };
        socket.emit('card:play', playData);
        if (is_logging) {
            client_log('playField', `Card ${droppedCardId} dropped at x:${x.toFixed(1)}%, y:${y.toFixed(1)}%`);
        }
    };
    const handleDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };
    const handleCardBack = (card) => {
        if (!myPlayerId)
            return;
        const backTo = card.fieldBackCondition[0] || 'discard';
        const requestData = {
            roomId,
            deckId: card.deckId || deckId,
            cardId: card.id,
        };
        if (backTo === 'hand') {
            requestData.playerId = myPlayerId;
        }
        socket.emit('card:move-from-field', requestData);
    };
    return (_jsxs("section", { className: `rg-playfield mode-${layoutMode}`, style: {
            background: backgroundImage ? `url(${backgroundImage}) center/cover no-repeat` : undefined,
        }, children: [_jsx("h3", { className: "rg-playfield-title", children: title !== undefined && title !== null ? title : `プレイフィールド (deckId=${deckId})` }), _jsx("div", { ref: containerRef, className: "rg-playfield-container", onPointerMove: handlePointerMove, onDrop: handleDrop, onDragOver: handleDragOver, style: {
                    position: 'relative',
                    minHeight: '600px',
                    touchAction: 'none',
                    overflow: 'visible',
                }, children: playedCards.map((card, index) => {
                    const owner = players.find((p) => p.id === card.ownerId);
                    const isDragging = activeDraggingId === card.id;
                    const isActuallyFreeShape = !!(card.freeShape && card.frontImage);
                    const isOverlapping = playedCards
                        .slice(0, index)
                        .some((other) => Math.abs((other.coordinate?.x ?? 50) - (card.coordinate?.x ?? 50)) < 1 &&
                        Math.abs((other.coordinate?.y ?? 50) - (card.coordinate?.y ?? 50)) < 1);
                    const visualOffset = isOverlapping ? index * 12 : 0;
                    const freeStyle = layoutMode === 'free'
                        ? {
                            position: 'absolute',
                            left: `${card.coordinate?.x ?? 50}%`,
                            top: `${card.coordinate?.y ?? 50}%`,
                            transform: `translate(calc(-50% + ${visualOffset}px), calc(-50% + ${visualOffset}px))`,
                            zIndex: isDragging ? 4 : 2,
                            transition: isDragging ? 'none' : 'left 0.2s ease, top 0.2s ease',
                        }
                        : {};
                    return (_jsxs("div", { draggable: false, onDragStart: (e) => e.preventDefault(), onPointerDown: (e) => handlePointerDown(e, card), onPointerUp: handlePointerUp, onPointerCancel: handlePointerUp, className: `${isActuallyFreeShape ? '' : cardStyles.card} rg-playfield-card-wrapper`, style: {
                            '--owner-color': owner?.color || '#aaaaaa',
                            ...freeStyle,
                            touchAction: 'none',
                            cursor: isDragging ? 'grabbing' : layoutMode === 'free' ? 'grab' : 'default',
                            width: '80px',
                            height: '112px',
                            // freeShape 時の設定
                            ...(isActuallyFreeShape
                                ? {
                                    background: 'transparent',
                                    border: 'none',
                                    boxShadow: isDragging ? '0 0 15px var(--owner-color)' : 'none',
                                    padding: 0,
                                }
                                : {}),
                        }, onDoubleClick: () => handleCardBack(card), children: [_jsx(CardDisplayContent, { card: card, canSeeFront: true }), card.ownerId && (_jsx("div", { className: "rg-playfield-owner-badge", title: `所有者: ${owner?.name || '不明'}`, children: owner?.name?.[0] || '?' })), card.description && !isDragging && _jsx("span", { className: cardStyles.tooltip, children: card.description })] }, card.id));
                }) })] }));
}
