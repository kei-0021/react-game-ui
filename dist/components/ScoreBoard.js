import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import * as React from "react";
import styles from "./ScoreBoard.module.css";
const CardDisplayContent = React.memo(({ card, canSeeFront }) => {
    if (!canSeeFront)
        return null;
    if (card.frontImage) {
        return (_jsx("img", { src: card.frontImage, alt: card.name, className: styles.cardImage }));
    }
    return _jsx("strong", { className: styles.cardNameText, children: card.name });
});
const TokenDisplayContent = React.memo(({ tokens, socket, roomId, myPlayerId, playerIdBeingDisplayed }) => {
    const isMyToken = myPlayerId === playerIdBeingDisplayed;
    if (!tokens || tokens.length === 0)
        return null;
    return (_jsx("div", { className: styles.tokenList, children: tokens.map((token) => (_jsx("div", { className: `${styles.tokenBadge} ${isMyToken ? styles.tokenBadgeOwner : styles.tokenBadgeGuest}`, onClick: () => {
                if (!isMyToken)
                    return;
                socket.emit("token:reclaim", {
                    roomId,
                    playerId: myPlayerId,
                    tokenId: token.id,
                });
            }, children: token.name }, token.id))) }));
});
const PlayerListItem = React.memo(({ player, currentPlayerId, myPlayerId, selectedCards, toggleCardSelection, socket, roomId, }) => {
    const isActive = player.id === currentPlayerId;
    const playerColor = player.color || "#aaaaaa";
    const isOwner = player.id === myPlayerId;
    const customStyles = {
        "--player-color": playerColor,
        "--player-color-bg": playerColor
            .replace("hsl", "hsla")
            .replace(")", ", 0.3)"),
        "--player-color-glow": playerColor
            .replace("hsl", "hsla")
            .replace(")", ", 0.5)"),
    };
    return (_jsxs("li", { className: `${styles.playerItem} ${isActive ? styles.activePlayer : ""}`, style: customStyles, children: [_jsxs("div", { className: styles.playerHeader, children: [_jsxs("span", { className: styles.playerName, children: [isActive && "ᐅ ", isOwner && "★ ME ", player.name] }), _jsxs("span", { className: styles.playerScore, children: ["\u30B9\u30B3\u30A2: ", player.score] })] }), player.resources?.length > 0 && (_jsx("div", { className: styles.resourceSection, children: _jsx("div", { className: styles.resourceList, children: player.resources.map((resource) => (_jsxs("span", { className: styles.resourceBadge, children: [resource.icon, " ", resource.name, ": ", resource.currentValue, " /", " ", resource.maxValue] }, resource.id))) }) })), _jsx(TokenDisplayContent, { tokens: player.tokens, socket: socket, roomId: roomId, myPlayerId: myPlayerId, playerIdBeingDisplayed: player.id }), _jsx("div", { className: styles.cardList, children: player.cards.map((card) => {
                    const isSelected = selectedCards.includes(card.id);
                    const canSeeFront = !!card.isFaceUp || isOwner;
                    return (_jsxs("div", { draggable: isOwner, onDragStart: (e) => {
                            if (!isOwner)
                                return;
                            // ドラッグ開始時にカード情報をセット
                            e.dataTransfer.setData("cardId", card.id);
                            e.dataTransfer.setData("deckId", card.deckId);
                            // ゴースト画像の挙動設定
                            e.dataTransfer.effectAllowed = "move";
                        }, className: `${styles.cardBase} rg-playfield-card-wrapper ${isSelected ? styles.cardSelected : ""} ${card.isFaceUp ? styles.cardSuperRevealed : ""}`, style: {
                            "--owner-color": playerColor,
                            "backgroundColor": canSeeFront ? "#fff" : card.backColor,
                            "cursor": isOwner ? "grab" : "default",
                            "border": card.isFaceUp
                                ? "3px solid #00ffff"
                                : "1px solid #ccc",
                            "boxShadow": card.isFaceUp ? "0 0 10px #00ffff" : "none",
                        }, onClick: () => toggleCardSelection(card.id, isOwner), children: [_jsx(CardDisplayContent, { card: card, canSeeFront: canSeeFront }), canSeeFront && card.description && (_jsx("span", { className: styles.tooltip, children: card.description }))] }, card.id));
                }) })] }));
});
export default function ScoreBoard({ socket, players, currentPlayerId, myPlayerId, roomId, playCardLimit, autoNextTurnOnCardPlay = false, }) {
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
        setSelectedCards((prev) => prev.includes(cardId)
            ? prev.filter((id) => id !== cardId)
            : [...prev, cardId]);
    }, []);
    const revealSelectedCards = React.useCallback(() => {
        if (selectedCards.length === 0 || !myPlayerId)
            return;
        if (playCardLimit !== undefined && selectedCards.length > playCardLimit)
            return;
        socket.emit("card:reveal", {
            roomId,
            playerId: myPlayerId,
            cardIds: selectedCards,
        });
        if (autoNextTurnOnCardPlay)
            socket.emit("game:next-turn", { roomId });
        setSelectedCards([]);
    }, [
        selectedCards,
        myPlayerId,
        socket,
        roomId,
        playCardLimit,
        autoNextTurnOnCardPlay,
    ]);
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
        Object.entries(cardsByDeck).forEach(([deckId, cardIds]) => {
            socket.emit("card:play", {
                roomId,
                deckId,
                cardIds,
                playerId: myPlayerId,
                playLocation: targetPlayLocation,
                // ボタン経由の場合は中央(50, 50)に設定
                position: { x: 50, y: 50 },
            });
        });
        if (autoNextTurnOnCardPlay)
            socket.emit("game:next-turn", { roomId });
        setSelectedCards([]);
    }, [
        selectedCards,
        myPlayerId,
        displayedPlayers,
        socket,
        roomId,
        playCardLimit,
        autoNextTurnOnCardPlay,
    ]);
    const nextTurn = () => socket.emit("game:next-turn", { roomId });
    const isOverLimit = playCardLimit !== undefined && selectedCards.length > playCardLimit;
    const isActionDisabled = selectedCards.length === 0 || isOverLimit;
    return (_jsxs("div", { className: styles.container, children: [_jsx("h2", { className: styles.title, children: "\u30B2\u30FC\u30E0\u30B9\u30B3\u30A2\u30DC\u30FC\u30C9" }), _jsx("ul", { className: styles.playerList, children: displayedPlayers.map((player) => (_jsx(PlayerListItem, { player: player, currentPlayerId: currentPlayerId, myPlayerId: myPlayerId, selectedCards: selectedCards, toggleCardSelection: toggleCardSelection, socket: socket, roomId: roomId }, player.id))) }), _jsxs("div", { className: styles.buttonArea, children: [isOverLimit && (_jsxs("p", { className: styles.limitMessage, children: ["\u4E00\u5EA6\u306B\u51FA\u305B\u308B\u30AB\u30FC\u30C9\u306F ", playCardLimit, " \u679A\u307E\u3067\u3067\u3059"] })), _jsxs("div", { className: styles.buttonGroup, children: [_jsx("button", { onClick: playSelectedCards, disabled: isActionDisabled, children: "\u9078\u629E\u30AB\u30FC\u30C9\u3092\u51FA\u3059" }), _jsx("button", { onClick: revealSelectedCards, disabled: isActionDisabled, children: "\u9078\u629E\u30AB\u30FC\u30C9\u3092\u516C\u958B\u3059\u308B" }), _jsx("button", { onClick: nextTurn, children: "\u30BF\u30FC\u30F3\u3092\u30B9\u30AD\u30C3\u30D7" })] })] })] }));
}
