import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import * as React from 'react';
import { CardDisplayContent } from './Card.js';
import scoreBoardStyles from './ScoreBoard.module.css';
import { Token } from './Token.js';
const PlayerListItem = React.memo(({ socket, roomId, player, currentPlayerId, myPlayerId, playCardButton, selectedCards, heldCards, toggleCardSelection, isDebug, enabled, }) => {
    const isActive = player.id === currentPlayerId;
    const playerColor = player.color || '#aaaaaa';
    const isOwner = player.id === myPlayerId;
    const [showPlay] = playCardButton;
    // --- スコアエフェクト用ステート ---
    const [scoreDiff, setScoreDiff] = React.useState(null);
    const [isScoreUpdating, setIsScoreUpdating] = React.useState(false);
    const prevScoreRef = React.useRef(player.score);
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
    const customStyles = {
        '--player-color': playerColor,
        '--player-color-bg': playerColor.replace('hsl', 'hsla').replace(')', ', 0.3)'),
        '--player-color-glow': playerColor.replace('hsl', 'hsla').replace(')', ', 0.5)'),
    };
    return (_jsxs("li", { className: `${scoreBoardStyles.playerItem} ${isActive ? scoreBoardStyles.activePlayer : ''}`, style: customStyles, children: [_jsxs("div", { className: scoreBoardStyles.playerHeader, children: [_jsxs("span", { className: scoreBoardStyles.playerName, children: [isActive && 'ᐅ ', isOwner && '★ ME ', player.name] }), _jsxs("div", { className: scoreBoardStyles.scoreArea, children: [_jsxs("div", { className: scoreBoardStyles.scoreWrapper, style: { position: 'relative', display: 'inline-block' }, children: [_jsxs("span", { className: scoreBoardStyles.playerScore, children: ["\u30B9\u30B3\u30A2: ", player.score] }), scoreDiff !== null && (_jsx("span", { className: `
      ${scoreBoardStyles.scoreChange} 
      ${scoreDiff > 0 ? scoreBoardStyles.plus : scoreBoardStyles.minus}
    `, children: scoreDiff > 0 ? `+${scoreDiff}` : scoreDiff }))] }), isDebug && (_jsxs("div", { className: scoreBoardStyles.debugScoreButtons, children: [_jsx("button", { onClick: () => handleAddScore(-1), disabled: !enabled, className: scoreBoardStyles.debugBtn, children: "-" }), _jsx("button", { onClick: () => handleAddScore(1), disabled: !enabled, className: scoreBoardStyles.debugBtn, children: "+" })] }))] })] }), player.resources?.length > 0 && (_jsx("div", { className: scoreBoardStyles.resourceSection, children: _jsx("div", { className: scoreBoardStyles.resourceList, children: player.resources.map((resource) => (_jsxs("span", { className: scoreBoardStyles.resourceBadge, children: [resource.icon, " ", resource.name, ": ", resource.currentValue, " / ", resource.maxValue] }, resource.resourceId))) }) })), _jsx("div", { className: scoreBoardStyles.tokenList, children: Object.entries(player.tokens || {}).map(([tokenId, token]) => (_jsx(Token, { token: token }, tokenId))) }), player.isHolding && _jsx("p", { className: scoreBoardStyles.isHoldMessage, children: "\u30AB\u30FC\u30C9\u3092\u30DB\u30FC\u30EB\u30C9\u3057\u3066\u3044\u307E\u3059" }), _jsx("div", { className: scoreBoardStyles.cardList, children: player.cards.map((card) => {
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
                  ${scoreBoardStyles.cardBase} 
                  ${isSelected ? scoreBoardStyles.cardSelected : ''}
                `, style: {
                            // ホールド中は禁止マーク、オーナーなら掴める、それ以外はデフォルト
                            cursor: isHeld ? 'not-allowed' : isOwner && enabled ? 'grab' : 'default',
                            border: card.isFaceUp ? '3px solid #00ffff' : '1px solid #ccc',
                            boxShadow: card.isFaceUp ? '0 0 10px #00ffff' : 'none',
                            opacity: !enabled || isHeld ? 0.7 : 1,
                            padding: 0,
                            overflow: 'hidden',
                            position: 'relative',
                            display: 'flex',
                            alignItems: 'stretch',
                            justifyContent: 'stretch',
                        }, 
                        // ホールド中はクリック（選択）も無効化
                        onClick: () => !isHeld && enabled && toggleCardSelection(card.id, isOwner), children: [_jsx(CardDisplayContent, { card: card, canSeeFront: canSeeFront }), isHeld && _jsx("div", { className: scoreBoardStyles.cardIsHeld, children: "\uD83D\uDD10" }), canSeeFront && card.description && (_jsx("span", { className: scoreBoardStyles.tooltip, children: card.description }))] }, card.id));
                }) })] }));
});
/**
 * スコアボードコンポーネント
 * プレイヤーの一覧、現在のターン、各プレイヤーのスコアやトークン数を表示する
 * 各ボタンのプロパティは [表示/非表示, 有効/無効] のタプル形式で受け取り、
 * 個別の有効フラグが `enabled` (全体設定) よりも優先して適用される。
 * @param {Socket} socket - Socket.ioのインスタンス
 * @param {RoomId} roomId - 現在のルームID
 * @param {PlayerId | null} myPlayerId - ローカルプレイヤーのID
 * @param {PlayerId | null} [currentPlayerId] - 現在の手番のプレイヤーID
 * @param {Player[]} players - ルームに参加しているプレイヤーのリスト
 * @param {number} [playCardLimit] - 1ターンにプレイ可能なカードの上限枚数
 * @param {[boolean, boolean]} [playCardButton=[true, true]] - カードプレイボタンの [表示, 有効]
 * @param {[boolean, boolean]} [holdButton=[false, true]] - カードホールドボタンの [表示, 有効]
 * @param {[boolean, boolean]} [flipButton=[false, true]] - カードをひっくり返すボタンの [表示, 有効]
 * @param {[boolean, boolean]} [turnSkipButton=[false, true]] - ターンスキップボタンの [表示, 有効]
 * @param {[boolean, boolean]} [roundSkipButton=[false, true]] - ラウンドスキップボタンの [表示, 有効]
 * @param {boolean} [isDebug=false] - スコアを手動で増減できるようにするかどうか (デバッグ用)
 * @param {boolean} [enabled=true] - 各種操作が全体的に有効かどうかのフラグ (個別設定がない場合のデフォルト)
 */
export function ScoreBoard({ socket, roomId, myPlayerId, currentPlayerId, players, playCardLimit, playCardButton = [true, true], holdButton = [false, true], flipButton = [false, true], turnSkipButton = [false, true], roundSkipButton = [false, true], isDebug = false, enabled = true, }) {
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
    const [heldCards, setHeldCards] = React.useState([]);
    const toggleCardSelection = React.useCallback((cardId, isOwner) => {
        if (!isOwner)
            return;
        setSelectedCards((prev) => (prev.includes(cardId) ? prev.filter((id) => id !== cardId) : [...prev, cardId]));
    }, []);
    const playSelectedCards = React.useCallback(({ isHold = false } = {}) => {
        if (selectedCards.length === 0 || !myPlayerId)
            return;
        if (playCardLimit !== undefined && selectedCards.length > playCardLimit)
            return;
        const myPlayer = displayedPlayers.find((p) => p.id === myPlayerId);
        if (!myPlayer)
            return;
        const cardsByDeck = {};
        let targetPlayLocation;
        if (isHold && myPlayer.isHolding == true)
            return;
        selectedCards.forEach((cardId) => {
            const card = myPlayer.cards.find((c) => c.id === cardId);
            if (!card)
                return;
            if (!targetPlayLocation)
                targetPlayLocation = card.playLocation;
            if (!cardsByDeck[card.deckId])
                cardsByDeck[card.deckId] = [];
            cardsByDeck[card.deckId].push(card.id);
            if (isHold)
                setHeldCards((prev) => [...prev, card.id]);
        });
        if (isHold == true) {
            socket.emit('card:hold', { roomId: roomId, playerId: myPlayerId, cardIdsbyDeck: cardsByDeck });
            setSelectedCards([]);
            return;
        }
        if (!targetPlayLocation)
            return;
        const finalLocation = targetPlayLocation;
        Object.entries(cardsByDeck).forEach(([deckId, cardIds]) => {
            socket.emit('card:play', {
                roomId,
                deckId,
                cardIds,
                playerId: myPlayerId,
                playLocation: finalLocation,
                coordinate: { x: 50, y: 50 },
            });
        });
        setSelectedCards([]);
    }, [selectedCards, myPlayerId, displayedPlayers, socket, roomId, playCardLimit]);
    const flipSelectedCards = React.useCallback(() => {
        if (selectedCards.length === 0 || !myPlayerId)
            return;
        socket.emit('card:flip', { roomId, playerId: myPlayerId, cardIds: selectedCards });
        setSelectedCards([]);
    }, [selectedCards, myPlayerId, socket, roomId]);
    // 各ボタンの状態を分解
    const [showPlay, canPlay] = playCardButton;
    const [showHold, canHold] = holdButton;
    const [showFlip, canFlip] = flipButton;
    const [showTurnSkip, canTurnSkip] = turnSkipButton;
    const [showRoundSkip, canRoundSkip] = roundSkipButton;
    // 無効判定ロジック：個別設定がある場合はそちらを優先、なければ全体のenabledを参照
    const isPlayDisabled = (canPlay !== undefined ? !canPlay : !enabled) || selectedCards.length === 0;
    const isHoldDisabled = (canHold !== undefined ? !canHold : !enabled) || selectedCards.length === 0;
    const isFlipDisabled = (canFlip !== undefined ? !canFlip : !enabled) || selectedCards.length === 0;
    const isTurnSkipDisabled = canTurnSkip !== undefined ? !canTurnSkip : !enabled;
    const isRoundSkipDisabled = canRoundSkip !== undefined ? !canRoundSkip : !enabled;
    const isOverLimit = playCardLimit !== undefined && selectedCards.length > playCardLimit;
    return (_jsxs("div", { className: scoreBoardStyles.container, children: [_jsx("h2", { className: scoreBoardStyles.title, children: "\u30B2\u30FC\u30E0\u30B9\u30B3\u30A2\u30DC\u30FC\u30C9" }), _jsx("ul", { className: scoreBoardStyles.playerList, children: displayedPlayers.map((player) => (_jsx(PlayerListItem, { socket: socket, roomId: roomId, player: player, currentPlayerId: currentPlayerId, myPlayerId: myPlayerId, playCardButton: playCardButton, selectedCards: selectedCards, heldCards: heldCards, toggleCardSelection: toggleCardSelection, isDebug: isDebug, enabled: enabled }, player.id))) }), _jsxs("div", { className: scoreBoardStyles.buttonArea, children: [isOverLimit && (_jsxs("p", { className: scoreBoardStyles.limitMessage, children: ["\u4E00\u5EA6\u306B\u51FA\u305B\u308B\u30AB\u30FC\u30C9\u306F ", playCardLimit, " \u679A\u307E\u3067\u3067\u3059"] })), _jsxs("div", { className: scoreBoardStyles.buttonGroup, children: [showPlay && (_jsx("button", { onClick: () => playSelectedCards(), disabled: isPlayDisabled || isOverLimit, children: "\u9078\u629E\u30AB\u30FC\u30C9\u3092\u51FA\u3059" })), showHold && (_jsx("button", { onClick: () => playSelectedCards({ isHold: true }), disabled: isHoldDisabled || isOverLimit, children: "\u9078\u629E\u30AB\u30FC\u30C9\u3092\u30DB\u30FC\u30EB\u30C9\u3059\u308B" })), showFlip && (_jsx("button", { onClick: flipSelectedCards, disabled: isFlipDisabled, children: "\u9078\u629E\u30AB\u30FC\u30C9\u3092\u3072\u3063\u304F\u308A\u8FD4\u3059" })), showTurnSkip && (_jsx("button", { onClick: () => socket.emit('game:next-turn', { roomId }), disabled: isTurnSkipDisabled, children: "\u30BF\u30FC\u30F3\u3092\u30B9\u30AD\u30C3\u30D7" })), showRoundSkip && (_jsx("button", { onClick: () => socket.emit('game:next-round', { roomId }), disabled: isRoundSkipDisabled, children: "\u30E9\u30A6\u30F3\u30C9\u3092\u30B9\u30AD\u30C3\u30D7" }))] })] })] }));
}
