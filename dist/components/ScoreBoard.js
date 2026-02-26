import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import * as React from 'react';
import { CardDisplayContent } from './Card.js';
import scoreBoardStyles from './ScoreBoard.module.css';
const TokenDisplayContent = React.memo(({ tokens, socket, roomId, myPlayerId, playerIdBeingDisplayed }) => {
    const isMyToken = myPlayerId === playerIdBeingDisplayed;
    if (!tokens || tokens.length === 0)
        return null;
    return (_jsx("div", { className: scoreBoardStyles.tokenList, children: tokens.map((token) => (_jsx("div", { className: `${scoreBoardStyles.tokenBadge} ${isMyToken ? scoreBoardStyles.tokenBadgeOwner : scoreBoardStyles.tokenBadgeGuest}`, onClick: () => {
                if (!isMyToken)
                    return;
                socket.emit('token:reclaim', {
                    roomId,
                    playerId: myPlayerId,
                    tokenId: token.id,
                });
            }, children: token.name }, token.id))) }));
});
const PlayerListItem = React.memo(({ player, currentPlayerId, myPlayerId, selectedCards, toggleCardSelection, socket, roomId, isDebug, }) => {
    const isActive = player.id === currentPlayerId;
    const playerColor = player.color || '#aaaaaa';
    const isOwner = player.id === myPlayerId;
    const handleAddScore = (points) => {
        socket.emit('room:player:add-score', {
            roomId,
            targetPlayerId: player.id,
            points,
        });
    };
    const customStyles = {
        '--player-color': playerColor,
        '--player-color-bg': playerColor.replace('hsl', 'hsla').replace(')', ', 0.3)'),
        '--player-color-glow': playerColor.replace('hsl', 'hsla').replace(')', ', 0.5)'),
    };
    return (_jsxs("li", { className: `${scoreBoardStyles.playerItem} ${isActive ? scoreBoardStyles.activePlayer : ''}`, style: customStyles, children: [_jsxs("div", { className: scoreBoardStyles.playerHeader, children: [_jsxs("span", { className: scoreBoardStyles.playerName, children: [isActive && 'ᐅ ', isOwner && '★ ME ', player.name] }), _jsxs("div", { className: scoreBoardStyles.scoreArea, children: [_jsxs("span", { className: scoreBoardStyles.playerScore, children: ["\u30B9\u30B3\u30A2: ", player.score] }), isDebug && (_jsxs("div", { className: scoreBoardStyles.debugScoreButtons, children: [_jsx("button", { onClick: () => handleAddScore(-1), className: scoreBoardStyles.debugBtn, children: "-" }), _jsx("button", { onClick: () => handleAddScore(1), className: scoreBoardStyles.debugBtn, children: "+" })] }))] })] }), player.resources?.length > 0 && (_jsx("div", { className: scoreBoardStyles.resourceSection, children: _jsx("div", { className: scoreBoardStyles.resourceList, children: player.resources.map((resource) => (_jsxs("span", { className: scoreBoardStyles.resourceBadge, children: [resource.icon, " ", resource.name, ": ", resource.currentValue, " / ", resource.maxValue] }, resource.resourceId))) }) })), _jsx(TokenDisplayContent, { tokens: player.tokens, socket: socket, roomId: roomId, myPlayerId: myPlayerId, playerIdBeingDisplayed: player.id }), _jsx("div", { className: scoreBoardStyles.cardList, children: player.cards.map((card) => {
                    const isSelected = selectedCards.includes(card.id);
                    const canSeeFront = !!card.isFaceUp || isOwner;
                    return (_jsxs("div", { draggable: isOwner, onDragStart: (e) => {
                            if (!isOwner)
                                return;
                            e.dataTransfer.setData('cardId', card.id);
                            e.dataTransfer.setData('deckId', card.deckId);
                            e.dataTransfer.effectAllowed = 'move';
                        }, className: `${scoreBoardStyles.cardBase} rg-playfield-card-wrapper ${isSelected ? scoreBoardStyles.cardSelected : ''} ${card.isFaceUp ? scoreBoardStyles.cardSuperRevealed : ''}`, style: {
                            cursor: isOwner ? 'grab' : 'default',
                            border: card.isFaceUp ? '3px solid #00ffff' : '1px solid #ccc',
                            boxShadow: card.isFaceUp ? '0 0 10px #00ffff' : 'none',
                            padding: 0,
                            overflow: 'hidden',
                            position: 'relative',
                            display: 'flex',
                            alignItems: 'stretch',
                            justifyContent: 'stretch',
                        }, onClick: () => toggleCardSelection(card.id, isOwner), children: [_jsx(CardDisplayContent, { card: card, canSeeFront: canSeeFront }), canSeeFront && card.description && (_jsx("span", { className: scoreBoardStyles.tooltip, children: card.description }))] }, card.id));
                }) })] }));
});
/**
 * スコアボードコンポーネント
 * プレイヤーの一覧、現在のターン、各プレイヤーのスコアやトークン数を表示する
 * @param {Socket} socket - Socket.ioのインスタンス
 * @param {PlayerWithResources[]} players - ルームに参加しているプレイヤーのリスト
 * @param {string | null} currentPlayerId - 現在の手番のプレイヤーID
 * @param {string | null} myPlayerId - ローカルプレイヤーのID
 * @param {string} roomId - 現在のルームID
 * @param {number} playCardLimit - 1ターンにプレイ可能なカードの上限枚数
 * @param {boolean} autoNextTurnOnCardPlay=false - カードプレイ時に自動でターンを終了するかどうか
 * @param {booleam} isDebug=false - スコアを手動で増減できるようにするかどうか (デバッグ用)
 */
export function ScoreBoard({ socket, players, currentPlayerId, myPlayerId, roomId, playCardLimit, autoNextTurnOnCardPlay = false, isDebug = false, }) {
    const displayedPlayers = React.useMemo(() => {
        return (players || []).map((p) => ({
            ...p,
            score: p.score ?? 0,
            cards: p.cards ?? [],
            resources: p.resources ?? [],
            tokens: p.tokens ?? [],
        }));
    }, [players]);
    const [selectedCards, setSelectedCards] = React.useState([]);
    const toggleCardSelection = React.useCallback((cardId, isOwner) => {
        if (!isOwner)
            return;
        setSelectedCards((prev) => (prev.includes(cardId) ? prev.filter((id) => id !== cardId) : [...prev, cardId]));
    }, []);
    const revealSelectedCards = React.useCallback(() => {
        if (selectedCards.length === 0 || !myPlayerId)
            return;
        if (playCardLimit !== undefined && selectedCards.length > playCardLimit)
            return;
        socket.emit('card:reveal', {
            roomId,
            playerId: myPlayerId,
            cardIds: selectedCards,
        });
        if (autoNextTurnOnCardPlay)
            socket.emit('game:next-turn', { roomId });
        setSelectedCards([]);
    }, [selectedCards, myPlayerId, socket, roomId, playCardLimit, autoNextTurnOnCardPlay]);
    const playSelectedCards = React.useCallback(() => {
        if (selectedCards.length === 0 || !myPlayerId)
            return;
        if (playCardLimit !== undefined && selectedCards.length > playCardLimit)
            return;
        const myPlayer = displayedPlayers.find((p) => p.id === myPlayerId);
        if (!myPlayer)
            return;
        const cardsByDeck = {};
        let targetPlayLocation;
        selectedCards.forEach((cardId) => {
            const card = myPlayer.cards.find((c) => c.id === cardId);
            if (!card)
                return;
            if (!targetPlayLocation)
                targetPlayLocation = card.playLocation;
            if (!cardsByDeck[card.deckId])
                cardsByDeck[card.deckId] = [];
            cardsByDeck[card.deckId].push(card.id);
        });
        if (!targetPlayLocation)
            return;
        const finalLocation = targetPlayLocation;
        Object.entries(cardsByDeck).forEach(([deckId, cardIds]) => {
            const playData = {
                roomId,
                deckId,
                cardIds,
                playerId: myPlayerId,
                playLocation: finalLocation,
                coordinate: { x: 50, y: 50 },
            };
            socket.emit('card:play', playData);
        });
        if (autoNextTurnOnCardPlay)
            socket.emit('game:next-turn', { roomId });
        setSelectedCards([]);
    }, [selectedCards, myPlayerId, displayedPlayers, socket, roomId, playCardLimit, autoNextTurnOnCardPlay]);
    const nextTurn = () => socket.emit('game:next-turn', { roomId });
    const isOverLimit = playCardLimit !== undefined && selectedCards.length > playCardLimit;
    const isActionDisabled = selectedCards.length === 0 || isOverLimit;
    return (_jsxs("div", { className: scoreBoardStyles.container, children: [_jsx("h2", { className: scoreBoardStyles.title, children: "\u30B2\u30FC\u30E0\u30B9\u30B3\u30A2\u30DC\u30FC\u30C9" }), _jsx("ul", { className: scoreBoardStyles.playerList, children: displayedPlayers.map((player) => (_jsx(PlayerListItem, { player: player, currentPlayerId: currentPlayerId, myPlayerId: myPlayerId, selectedCards: selectedCards, toggleCardSelection: toggleCardSelection, socket: socket, roomId: roomId, isDebug: isDebug }, player.id))) }), _jsxs("div", { className: scoreBoardStyles.buttonArea, children: [isOverLimit && (_jsxs("p", { className: scoreBoardStyles.limitMessage, children: ["\u4E00\u5EA6\u306B\u51FA\u305B\u308B\u30AB\u30FC\u30C9\u306F ", playCardLimit, " \u679A\u307E\u3067\u3067\u3059"] })), _jsxs("div", { className: scoreBoardStyles.buttonGroup, children: [_jsx("button", { onClick: playSelectedCards, disabled: isActionDisabled, children: "\u9078\u629E\u30AB\u30FC\u30C9\u3092\u51FA\u3059" }), _jsx("button", { onClick: revealSelectedCards, disabled: isActionDisabled, children: "\u9078\u629E\u30AB\u30FC\u30C9\u3092\u516C\u958B\u3059\u308B" }), _jsx("button", { onClick: nextTurn, children: "\u30BF\u30FC\u30F3\u3092\u30B9\u30AD\u30C3\u30D7" })] })] })] }));
}
