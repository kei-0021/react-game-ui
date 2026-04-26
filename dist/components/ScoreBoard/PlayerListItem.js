import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import * as React from 'react';
import { Card } from '../Card/Card.js';
import { Token } from '../Token.js';
import playerListItemStyles from './PlayerListItem.module.css';
export const PlayerListItem = React.memo(({ socket, roomId, player, currentPlayerId, myPlayerId, playCardButton, selectedCards, heldCards, toggleCardSelection, isDebug, enabled, }) => {
    const isActive = player.id === currentPlayerId;
    const playerColor = player.color || '#aaaaaa';
    const isOwner = player.id === myPlayerId;
    const [showPlay] = playCardButton;
    // --- スコアエフェクト用ステート ---
    const [scoreDiff, setScoreDiff] = React.useState(null);
    const [isScoreUpdating, setIsScoreUpdating] = React.useState(false);
    const prevScoreRef = React.useRef(player.score);
    if (!myPlayerId)
        return;
    React.useEffect(() => {
        const prevScore = prevScoreRef.current;
        if (prevScore !== player.score) {
            const diff = player.score - prevScore;
            setScoreDiff(diff);
            setIsScoreUpdating(true);
            // バーストに合わせて短くクリア (600ms)
            const timer = setTimeout(() => {
                setScoreDiff(null);
                setIsScoreUpdating(false);
            }, 600);
            prevScoreRef.current = player.score;
            return () => clearTimeout(timer);
        }
    }, [player.score]);
    // ----------------------------
    const handleAddScore = (points) => {
        socket.emit('player:add-score', {
            roomId,
            targetPlayerId: player.id,
            points,
        });
    };
    // トークン移動
    const handleTokenDragStart = (e, token) => {
        e.dataTransfer.setData('tokenId', token.id);
        e.dataTransfer.setData('source', 'ScoreBoard');
        e.dataTransfer.setData('playerId', myPlayerId);
        e.dataTransfer.effectAllowed = 'move';
    };
    const customStyles = {
        '--player-color': playerColor,
        '--player-color-bg': playerColor.replace('hsl', 'hsla').replace(')', ', 0.3)'),
        '--player-color-glow': playerColor.replace('hsl', 'hsla').replace(')', ', 0.5)'),
    };
    return (_jsxs("li", { className: `${playerListItemStyles.playerItem} ${isActive ? playerListItemStyles.activePlayer : ''}`, style: customStyles, children: [_jsxs("div", { className: playerListItemStyles.playerHeader, children: [_jsxs("span", { className: playerListItemStyles.playerName, children: [isActive && 'ᐅ ', isOwner && '★ ME ', player.name] }), _jsxs("div", { className: playerListItemStyles.scoreArea, children: [_jsxs("div", { className: playerListItemStyles.scoreWrapper, style: { position: 'relative', display: 'inline-block' }, children: [_jsxs("span", { className: playerListItemStyles.playerScore, children: ["\u30B9\u30B3\u30A2: ", player.score] }), scoreDiff !== null && (_jsx("span", { className: `
      ${playerListItemStyles.scoreChange} 
      ${scoreDiff > 0 ? playerListItemStyles.plus : playerListItemStyles.minus}
    `, children: scoreDiff > 0 ? `+${scoreDiff}` : scoreDiff }))] }), isDebug && (_jsxs("div", { className: playerListItemStyles.debugScoreButtons, children: [_jsx("button", { onClick: () => handleAddScore(-1), disabled: !enabled, className: playerListItemStyles.debugBtn, children: "-" }), _jsx("button", { onClick: () => handleAddScore(1), disabled: !enabled, className: playerListItemStyles.debugBtn, children: "+" })] }))] })] }), player.resources?.length > 0 && (_jsx("div", { className: playerListItemStyles.resourceSection, children: _jsx("div", { className: playerListItemStyles.resourceList, children: player.resources.map((resource) => (_jsxs("span", { className: playerListItemStyles.resourceBadge, children: [resource.icon, " ", resource.name, ": ", resource.currentValue, " / ", resource.maxValue] }, resource.resourceId))) }) })), _jsx("div", { className: playerListItemStyles.tokenList, children: Object.entries(player.tokens || {}).map(([tokenId, token]) => (_jsx(Token, { token: token, isDraggable: isOwner, onDragStart: handleTokenDragStart }, tokenId))) }), player.isHolding && _jsx("p", { className: playerListItemStyles.isHoldMessage, children: "\u30AB\u30FC\u30C9\u3092\u30DB\u30FC\u30EB\u30C9\u3057\u3066\u3044\u307E\u3059" }), _jsx("div", { className: playerListItemStyles.cardList, children: player.cards.map((card) => {
                    const isSelected = selectedCards.includes(card.id);
                    const isHeld = heldCards.includes(card.id);
                    const canSeeFront = !!card.isFaceUp || isOwner;
                    return (_jsxs("div", { 
                        // ホールド中、オーナーでない場合、カードプレイボタンがない場合はドラッグ不可
                        draggable: isOwner && !isHeld && enabled, onDragStart: (e) => {
                            if (!isOwner || isHeld || !showPlay)
                                return;
                            e.dataTransfer.setData('cardId', card.id);
                            e.dataTransfer.setData('deckId', card.deckId);
                            e.dataTransfer.effectAllowed = 'move';
                        }, className: `
                  ${playerListItemStyles.cardBase} 
                  ${isSelected ? playerListItemStyles.cardSelected : ''}
                `, style: {
                            // ホールド中は禁止マーク、オーナーなら掴める、それ以外はデフォルト
                            cursor: isHeld ? 'not-allowed' : isOwner && enabled ? 'grab' : 'default',
                            border: card.isFaceUp ? '3px solid #00ffff' : '1px solid #ccc',
                            boxShadow: card.isFaceUp ? '0 0 10px #00ffff' : 'none',
                            opacity: !enabled || isHeld ? 0.7 : 1,
                            padding: 0,
                            overflow: 'visible',
                            position: 'relative',
                            display: 'flex',
                            alignItems: 'stretch',
                            justifyContent: 'stretch',
                        }, children: [_jsx(Card, { card: card, canSeeFront: canSeeFront, onClick: () => !isHeld && enabled && toggleCardSelection(card.id, isOwner), showPreview: false }), isHeld && _jsx("div", { className: playerListItemStyles.cardIsHeld, children: "\uD83D\uDD10" })] }, card.id));
                }) })] }));
});
