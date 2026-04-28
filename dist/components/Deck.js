import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import * as React from 'react';
import { useEffect } from 'react';
import { Card, CardDisplayContent } from './Card/Card.js';
import cardStyles from './Card/Card.module.css';
import deckStyles from './Deck.module.css';
/**
 * 山札の描画、シャッフル、ドローの制御を行う。
 * @param socket - 通信用のSocket.ioインスタンス
 * @param roomId - 対象のルームID
 * @param deckId - 山札を識別する一意のID
 * @param title - 山札の表示名
 * @param myPlayerId - 操作者自身のプレイヤーID。手札へのドロー先として使用。
 * @param currentPlayerId - 現在のターンプレイヤーID。ターン制の判定に使用。
 * @param alwaysDraw - ターンの制約を無視してドロー可能にするフラグ。
 * @param size={ width: 90, height: 120 } - デッキのサイズ。
 * @param enabled=true - 各種操作が有効かどうかのフラグ。
 */
export function Deck({ socket, roomId, deckId, title, myPlayerId, currentPlayerId, alwaysDraw = false, size = { width: 90, height: 120 }, enabled = true, }) {
    const [deckCards, setDeckCards] = React.useState([]);
    const [discardPile, setDiscardPile] = React.useState([]);
    const [showDiscardModal, setShowDiscardModal] = React.useState(false);
    useEffect(() => {
        socket.on(`deck:update:${deckId}`, (data) => {
            setDeckCards(data.currentDeck.map((c) => ({ ...c, deckId })));
            setDiscardPile(data.discardPile.map((c) => ({ ...c, deckId })));
        });
        return () => {
            socket.off(`deck:update:${deckId}`);
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
    const handleContextMenu = (e) => {
        e.preventDefault(); // 標準メニューを阻止
        if (discardPile.length === 0)
            return;
        // 捨て札確認モーダルを開くフラグを立てる
        setShowDiscardModal(true);
    };
    return (_jsxs("section", { className: deckStyles.deckSection, children: [_jsx("h3", { className: deckStyles.deckTitle, children: title }), _jsxs("div", { className: deckStyles.deckControls, children: [_jsx("button", { onClick: shuffle, disabled: !enabled, children: "\u30B7\u30E3\u30C3\u30D5\u30EB" }), _jsx("button", { onClick: resetDeck, disabled: !enabled, children: "\u5C71\u672D\u306B\u623B\u3059" })] }), _jsxs("div", { className: deckStyles.deckWrapperFlex, children: [_jsxs("div", { className: `${deckStyles.deckContainer} ${!enabled ? cardStyles.disabled : ''}`, style: { width: size.width, height: size.height }, onClick: () => enabled && draw(), children: [deckCards.length > 0 && _jsx("div", { className: deckStyles.deckCountBadge, children: deckCards.length }), deckCards.map((c, i) => (_jsx("div", { className: cardStyles.deckCard, style: {
                                    zIndex: deckCards.length - i,
                                    transform: `translate(${i * 0.3}px, ${i * 0.3}px)`,
                                    backgroundColor: c.backColor,
                                } }, c.id)))] }), _jsx("div", { className: `${deckStyles.deckContainer} ${cardStyles.discardPileWrapper}`, style: { width: size.width, height: size.height }, onContextMenu: handleContextMenu, children: discardPile.map((c, i) => (_jsx("div", { className: cardStyles.deckCardFront, style: {
                                width: size.width,
                                height: size.height,
                                zIndex: i + 1,
                                transform: `translate(${i * -0.3}px, ${i * -0.3}px)`,
                            }, children: _jsx(Card, { card: c, canSeeFront: true, showPreview: true, size: size }) }))) }), showDiscardModal && (_jsx("div", { className: deckStyles.discardModalOverlay, onClick: () => setShowDiscardModal(false), children: _jsxs("div", { className: deckStyles.discardModalContent, onClick: (e) => e.stopPropagation(), children: [_jsxs("div", { className: deckStyles.discardModalHeader, children: [_jsx("h4", { children: "\u6368\u3066\u672D\u306E\u5185\u5BB9" }), _jsx("button", { onClick: () => setShowDiscardModal(false), children: "\u9589\u3058\u308B" })] }), _jsx("div", { className: deckStyles.discardModalGrid, children: discardPile
                                        .slice()
                                        .reverse()
                                        .map((c) => (_jsx("div", { className: deckStyles.discardModalCard, children: _jsx(CardDisplayContent, { card: c, canSeeFront: true, size: size }) }, c.id))) })] }) }))] })] }));
}
