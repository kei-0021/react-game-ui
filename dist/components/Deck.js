import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import * as React from 'react';
import { CardDisplayContent } from './Card.js';
import cardStyles from './Card.module.css';
import deckStyles from './Deck.module.css';
/**
 * 山札の描画、シャッフル、ドローの制御を行う。
 * @param socket - 通信用のSocket.ioインスタンス
 * @param roomId - 対象のルームID
 * @param deckId - 山札を識別する一意のID
 * @param title - 山札の表示名
 * @param currentPlayerId - 現在のターンプレイヤーID。ターン制の判定に使用。
 * @param myPlayerId - 操作者自身のプレイヤーID。手札へのドロー先として使用。
 * @param alwaysDraw - ターンの制約を無視してドロー可能にするフラグ。
 * @param enabled=true - 各種操作が有効かどうかのフラグ。
 */
export function Deck({ socket, roomId, deckId, title, currentPlayerId, myPlayerId, alwaysDraw = false, enabled = true, }) {
    const [deckCards, setDeckCards] = React.useState([]);
    const [discardPile, setDiscardPile] = React.useState([]);
    const [isDiscardHovered, setIsDiscardHovered] = React.useState(false);
    React.useEffect(() => {
        socket.on(`deck:update:${roomId}:${deckId}`, (data) => {
            setDeckCards(data.currentDeck.map((c) => ({ ...c, deckId })));
            setDiscardPile(data.discardPile.map((c) => ({ ...c, deckId })));
        });
        return () => {
            socket.off(`deck:update:${roomId}:${deckId}`);
        };
    }, [socket, roomId, deckId]);
    const draw = () => {
        if (!deckCards || deckCards.length === 0)
            return;
        const cardToDraw = deckCards[0];
        const [targetLocation, targetState] = cardToDraw.drawCondition || ['hand', 'back'];
        // 送信用データの作成
        const requestData = {
            roomId,
            deckId,
            drawCondition: [targetLocation, targetState],
        };
        // 権限チェック
        if (targetLocation === 'hand') {
            const canDrawToHand = alwaysDraw || currentPlayerId === myPlayerId;
            if (canDrawToHand && myPlayerId) {
                requestData.playerId = myPlayerId;
            }
            else {
                console.warn('手札に引く権限がありません。');
                return;
            }
        }
        socket.emit('deck:draw', requestData);
    };
    const shuffle = () => socket.emit('deck:shuffle', { roomId, deckId });
    const resetDeck = () => socket.emit('deck:reset', { roomId, deckId });
    return (_jsxs("section", { className: cardStyles.deckSection, children: [_jsx("h3", { className: deckStyles.deckTitle, children: title }), _jsxs("div", { className: cardStyles.deckControls, children: [_jsx("button", { onClick: shuffle, children: "\u30B7\u30E3\u30C3\u30D5\u30EB" }), _jsx("button", { onClick: resetDeck, children: "\u5C71\u672D\u306B\u623B\u3059" })] }), _jsxs("div", { className: `${cardStyles.deckWrapper} ${deckStyles.deckWrapperFlex}`, children: [_jsx("div", { className: cardStyles.deckContainer, onClick: () => enabled && draw(), children: deckCards.map((c, i) => (_jsx("div", { className: cardStyles.deckCard, style: {
                                zIndex: deckCards.length - i,
                                transform: `translate(${i * 0.3}px, ${i * 0.3}px)`,
                                backgroundColor: c.backColor,
                            } }, c.id))) }), _jsx("div", { className: `${cardStyles.deckContainer} ${cardStyles.discardPileWrapper}`, children: discardPile.map((c, i) => (_jsxs("div", { className: cardStyles.deckCardFront, style: {
                                zIndex: i + 1,
                                transform: `translate(${i * -0.3}px, ${i * -0.3}px)`,
                                pointerEvents: i === discardPile.length - 1 ? 'auto' : 'none',
                            }, onMouseEnter: () => i === discardPile.length - 1 && setIsDiscardHovered(true), onMouseLeave: () => i === discardPile.length - 1 && setIsDiscardHovered(false), children: [_jsx(CardDisplayContent, { card: c, canSeeFront: true }), i === discardPile.length - 1 && c.description && (_jsx("span", { className: `${cardStyles.tooltip} ${deckStyles.tooltipBase}`, style: {
                                        visibility: isDiscardHovered ? 'visible' : 'hidden',
                                        opacity: isDiscardHovered ? 1 : 0,
                                    }, children: c.description }))] }, c.id))) })] })] }));
}
