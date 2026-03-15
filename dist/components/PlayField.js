import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import * as React from 'react';
import { CardDisplayContent } from './Card.js';
import cardStyles from './Card.module.css';
import playFieldStyles from './PlayField.module.css';
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
/**
 * カードを自由配置（Free Mode）またはグリッド配置し、移動やドロップ操作を管理する
 * @param {Socket} socket - Socket.ioのインスタンス
 * @param {RoomId} roomId - 現在のルームID
 * @param {DeckId} deckId - このフィールドが紐付いているデッキのID
 * @param {string} [title] - フィールドの表示タイトル
 * @param {Player[]} players - ルームに参加しているプレイヤー情報（オーナー表示用）
 * @param {PlayerId | null} myPlayerId - ローカルプレイヤーのID
 * @param {'grid' | 'free'} [layoutMode='free'] - カードの配置モード（自由配置またはグリッド）
 * @param {string} [backgroundImage] - フィールドの背景画像URL
 * @param {string} [zIndex] - カードの重ね順
 * @param {boolean} [isDebug=false] - z-indexをUI表示するフラグ (デバッグ用)
 */
export function PlayField({ socket, roomId, deckId, title, players, myPlayerId, layoutMode = 'free', backgroundImage, zIndex = 100, isDebug = false, }) {
    const [playedCards, setPlayedCards] = React.useState([]);
    const [activeDraggingId, setActiveDraggingId] = React.useState(null);
    // ドラッグ中のローカルな座標を保持（ラグを消すためのステート）
    const [dragPos, setDragPos] = React.useState(null);
    // 右クリックメニュー用のステート (Draggableの仕様に合わせる)
    const [contextMenu, setContextMenu] = React.useState(null);
    const containerRef = React.useRef(null);
    const draggingIdRef = React.useRef(null);
    // メニュー外クリックで閉じる (Draggableと同様の処理)
    React.useEffect(() => {
        const closeMenu = () => setContextMenu(null);
        if (contextMenu) {
            window.addEventListener('click', closeMenu);
        }
        return () => window.removeEventListener('click', closeMenu);
    }, [contextMenu]);
    React.useEffect(() => {
        socket.on(`deck:update:${deckId}`, (data) => {
            const newCards = data.playFieldCards || [];
            setPlayedCards(newCards);
        });
        return () => {
            socket.off(`deck:update:${deckId}`);
        };
    }, [socket, roomId, deckId]);
    // リアルタイム送信ロジック（throttleを30msに短縮して追従性を向上）
    // 宛先をその都度書くスタイルにしてクロージャ問題を回避
    const emitMove = React.useMemo(() => throttle((cardId, clientX, clientY, rId, dId) => {
        if (!containerRef.current || !rId || !dId)
            return;
        const rect = containerRef.current.getBoundingClientRect();
        // 座標計算 & 0-100% の範囲にクランプ
        let x = ((clientX - rect.left) / rect.width) * 100;
        let y = ((clientY - rect.top) / rect.height) * 100;
        x = Math.max(0, Math.min(100, x));
        y = Math.max(0, Math.min(100, y));
        socket.emit('card:move-on-field', {
            roomId: rId,
            deckId: dId,
            cardId,
            coordinate: { x, y },
        });
    }, 30), [socket]);
    const handlePointerDown = (e, card) => {
        if (layoutMode !== 'free')
            return;
        draggingIdRef.current = card.id;
        setActiveDraggingId(card.id);
        // 掴んだ瞬間の座標を即座にステートに入れる
        setDragPos({ x: card.coordinate?.x ?? 50, y: card.coordinate?.y ?? 50 });
        e.currentTarget.setPointerCapture(e.pointerId);
        // 全カードの中から最大の zIndex を探す
        const maxZ = Math.max(...playedCards.map((c) => c.zIndex ?? 100), 100);
        // 自分が最大でなければ、maxZ + 1 を自分に割り当てる
        if ((card.zIndex ?? 0) < maxZ) {
            card.zIndex = maxZ + 1;
        }
    };
    // 右クリックハンドラ (Draggableの形式に合わせる)
    const handleContextMenu = (e, card) => {
        e.preventDefault();
        e.stopPropagation();
        setContextMenu({ x: e.clientX, y: e.clientY, card });
    };
    const handlePointerMove = (e) => {
        if (!draggingIdRef.current || !containerRef.current)
            return;
        const rect = containerRef.current.getBoundingClientRect();
        // 画面更新用のローカル座標を計算
        const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
        const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
        // 通信とは別に、自分の画面の表示を即座に更新する
        setDragPos({ x, y });
        // Propsの最新値を引数として渡す
        emitMove(draggingIdRef.current, e.clientX, e.clientY, roomId, deckId);
    };
    const handlePointerUp = (e) => {
        if (!draggingIdRef.current)
            return;
        // 終了時も最新のIDを添えて送信
        emitMove(draggingIdRef.current, e.clientX, e.clientY, roomId, deckId);
        e.currentTarget.releasePointerCapture(e.pointerId);
        draggingIdRef.current = null;
        setActiveDraggingId(null);
        setDragPos(null);
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
    };
    const handleDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };
    const handleCardBack = (card) => {
        if (!myPlayerId || !card.fieldBackCondition)
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
            // 親の zIndex を消すことで、中のカードが Draggable と同じ階層で比較されるようにする
            position: 'relative',
        }, children: [_jsx("h3", { className: playFieldStyles.rgPlayfieldTitle, children: title !== undefined && title !== null ? title : `プレイフィールド (deckId=${deckId})` }), _jsxs("div", { ref: containerRef, className: playFieldStyles.rgPlayFieldContainer, onPointerMove: handlePointerMove, onDrop: handleDrop, onDragOver: handleDragOver, style: {
                    position: 'relative',
                    minHeight: '600px',
                    touchAction: 'none',
                    overflow: 'visible',
                }, children: [playedCards.map((card) => {
                        const owner = players.find((p) => p.id === card.ownerId);
                        const isDragging = activeDraggingId === card.id;
                        const isActuallyFreeShape = !!(card.freeShape && card.frontImage);
                        // ドラッグ中ならローカルの座標、そうでなければカード情報の座標を使用
                        const displayX = isDragging && dragPos ? dragPos.x : (card.coordinate?.x ?? 50);
                        const displayY = isDragging && dragPos ? dragPos.y : (card.coordinate?.y ?? 50);
                        // 表示用の最終的な zIndex
                        const currentZIndex = isDragging ? zIndex + 1000 : (card.zIndex ?? zIndex + 2);
                        const freeStyle = layoutMode === 'free'
                            ? {
                                position: 'absolute',
                                left: `${displayX}%`,
                                top: `${displayY}%`,
                                zIndex: currentZIndex,
                                // マウスの先端ではなく、カードの中心を掴むように補正
                                transform: 'translate(-50%, -50%)',
                                // ドラッグ中はアニメーションを切り、それ以外は滑らかに戻る
                                transition: isDragging ? 'none' : 'left 0.2s ease, top 0.2s ease',
                            }
                            : {};
                        return (_jsxs("div", { draggable: false, onDragStart: (e) => e.preventDefault(), onPointerDown: (e) => handlePointerDown(e, card), onPointerUp: handlePointerUp, onContextMenu: (e) => handleContextMenu(e, card), onPointerCancel: handlePointerUp, className: `${isActuallyFreeShape ? '' : cardStyles.card} ${playFieldStyles.rgPlayFieldCardWrapper}`, style: {
                                '--owner-color': owner?.color || '#aaaaaa',
                                ...freeStyle,
                                touchAction: 'none',
                                cursor: isDragging ? 'grabbing' : layoutMode === 'free' ? 'grab' : 'default',
                                width: '80px',
                                height: '112px',
                                background: 'transparent',
                                border: isActuallyFreeShape ? 'none' : undefined,
                                boxShadow: isActuallyFreeShape && isDragging ? '0 0 15px var(--owner-color)' : 'none',
                                padding: 0,
                                display: 'block',
                                position: layoutMode === 'free' ? 'absolute' : 'relative',
                                zIndex: currentZIndex,
                            }, children: [_jsx(CardDisplayContent, { card: card, canSeeFront: card.isFaceUp }), card.ownerId && (_jsx("div", { className: playFieldStyles.rgPlayFieldOwnerBadge, title: `所有者: ${owner?.name || '不明'}`, children: owner?.name?.[0] || '?' })), isDebug && (_jsxs("div", { className: playFieldStyles.debugLabel, style: { zIndex: 10001 }, children: ["Z:", currentZIndex] })), card.description && !isDragging && card.isFaceUp && (_jsx("span", { className: cardStyles.tooltip, children: card.description }))] }, card.id));
                    }), contextMenu && (_jsxs("div", { className: playFieldStyles.contextMenu, style: {
                            top: contextMenu.y,
                            left: contextMenu.x,
                            position: 'fixed', // Draggableに合わせてfixed
                        }, onClick: (e) => e.stopPropagation(), children: [_jsxs("div", { className: playFieldStyles.menuItem, onClick: () => {
                                    const maxZ = Math.max(...playedCards.map((c) => c.zIndex ?? 100), 100);
                                    const requestData = {
                                        roomId,
                                        deckId: contextMenu.card.deckId || deckId,
                                        cardId: contextMenu.card.id,
                                        coordinate: contextMenu.card.coordinate,
                                        zIndex: maxZ + 1,
                                    };
                                    socket.emit('card:move-on-field', requestData);
                                    setContextMenu(null);
                                }, children: [_jsx("span", { className: playFieldStyles.menuIcon, children: "\u2B06\uFE0F" }), _jsx("span", { children: "\u6700\u524D\u9762\u3078\u79FB\u52D5" })] }), _jsxs("div", { className: playFieldStyles.menuItem, onClick: () => {
                                    const minZ = Math.min(...playedCards.map((c) => c.zIndex ?? 100), 100);
                                    const requestData = {
                                        roomId,
                                        deckId: contextMenu.card.deckId || deckId,
                                        cardId: contextMenu.card.id,
                                        coordinate: contextMenu.card.coordinate,
                                        zIndex: Math.max(0, minZ - 1),
                                    };
                                    socket.emit('card:move-on-field', requestData);
                                    setContextMenu(null);
                                }, children: [_jsx("span", { className: playFieldStyles.menuIcon, children: "\u2B07\uFE0F" }), _jsx("span", { children: "\u6700\u80CC\u9762\u3078\u79FB\u52D5" })] }), _jsx("div", { style: { height: '1px', background: '#444', margin: '4px 0' } }), _jsxs("div", { className: playFieldStyles.menuItem, onClick: () => {
                                    socket.emit('card:flip', {
                                        roomId: roomId,
                                        playerId: myPlayerId,
                                        cardIds: [contextMenu.card.id],
                                    });
                                    setContextMenu(null);
                                }, children: [_jsx("span", { className: playFieldStyles.menuIcon, children: "\uD83D\uDD04" }), _jsx("span", { children: "\u30AB\u30FC\u30C9\u3092\u88CF\u8FD4\u3059" })] }), contextMenu.card.fieldBackCondition && (_jsxs("div", { className: playFieldStyles.menuItem, onClick: () => {
                                    handleCardBack(contextMenu.card);
                                    setContextMenu(null);
                                }, children: [_jsx("span", { className: playFieldStyles.menuIcon, children: "\u270B" }), _jsx("span", { children: "\u624B\u672D/\u6368\u3066\u672D\u3078\u623B\u3059" })] }))] }))] })] }));
}
