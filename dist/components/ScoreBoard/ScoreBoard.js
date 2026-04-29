import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import * as React from 'react';
import { PlayerListItem } from './PlayerListItem.js';
import scoreBoardStyles from './ScoreBoard.module.css';
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
 * @param {{width: number, height: number}} [size={widht: 90, height: 120}] - カードのサイズ
 * @param {boolean} [isDebug=false] - スコアを手動で増減できるようにするかどうか (デバッグ用)
 * @param {boolean} [enabled=true] - 各種操作が全体的に有効かどうかのフラグ (個別設定がない場合のデフォルト)
 */
export function ScoreBoard({ socket, roomId, myPlayerId, currentPlayerId, players, playCardLimit, playCardButton = [true, true], holdButton = [false, true], flipButton = [false, true], turnSkipButton = [false, true], roundSkipButton = [false, true], size = { width: 90, height: 120 }, isDebug = false, enabled = true, }) {
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
    return (_jsxs("div", { className: scoreBoardStyles.scoreBoardContainer, children: [_jsx("h2", { className: scoreBoardStyles.title, children: "\u30B2\u30FC\u30E0\u30B9\u30B3\u30A2\u30DC\u30FC\u30C9" }), _jsx("ul", { className: scoreBoardStyles.playerList, children: displayedPlayers.map((player) => (_jsx(PlayerListItem, { socket: socket, roomId: roomId, player: player, currentPlayerId: currentPlayerId, myPlayerId: myPlayerId, playCardButton: playCardButton, selectedCards: selectedCards, heldCards: heldCards, toggleCardSelection: toggleCardSelection, size: size, isDebug: isDebug, enabled: enabled }, player.id))) }), _jsxs("div", { className: scoreBoardStyles.buttonArea, children: [isOverLimit && (_jsxs("p", { className: scoreBoardStyles.limitMessage, children: ["\u4E00\u5EA6\u306B\u51FA\u305B\u308B\u30AB\u30FC\u30C9\u306F ", playCardLimit, " \u679A\u307E\u3067\u3067\u3059"] })), _jsxs("div", { className: scoreBoardStyles.buttonGroup, children: [showPlay && (_jsx("button", { onClick: () => playSelectedCards(), disabled: isPlayDisabled || isOverLimit, children: "\u9078\u629E\u30AB\u30FC\u30C9\u3092\u51FA\u3059" })), showHold && (_jsx("button", { onClick: () => playSelectedCards({ isHold: true }), disabled: isHoldDisabled || isOverLimit, children: "\u9078\u629E\u30AB\u30FC\u30C9\u3092\u30DB\u30FC\u30EB\u30C9\u3059\u308B" })), showFlip && (_jsx("button", { onClick: flipSelectedCards, disabled: isFlipDisabled, children: "\u9078\u629E\u30AB\u30FC\u30C9\u3092\u3072\u3063\u304F\u308A\u8FD4\u3059" })), showTurnSkip && (_jsx("button", { onClick: () => socket.emit('game:next-turn', { roomId }), disabled: isTurnSkipDisabled, children: "\u30BF\u30FC\u30F3\u3092\u30B9\u30AD\u30C3\u30D7" })), showRoundSkip && (_jsx("button", { onClick: () => socket.emit('game:next-round', { roomId }), disabled: isRoundSkipDisabled, children: "\u30E9\u30A6\u30F3\u30C9\u3092\u30B9\u30AD\u30C3\u30D7" }))] })] })] }));
}
