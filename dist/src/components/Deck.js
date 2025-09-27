import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// src/components/Deck.tsx
import React from "react";
import styles from "./Card.module.css";
export default function Deck({ socket, deckId, name, playerId = null }) {
    const [deckCards, setDeckCards] = React.useState([]);
    const [drawnCards, setDrawnCards] = React.useState([]);
    React.useEffect(() => {
        socket.on(`deck:init:${deckId}`, (data) => {
            setDeckCards(data.currentDeck.map(c => ({ ...c, deckId })));
            setDrawnCards(data.drawnCards.map(c => ({ ...c, deckId })));
        });
        socket.on(`deck:update:${deckId}`, (data) => {
            setDeckCards(data.currentDeck.map(c => ({ ...c, deckId })));
            setDrawnCards(data.drawnCards.map(c => ({ ...c, deckId })));
        });
        return () => {
            socket.off(`deck:init:${deckId}`);
            socket.off(`deck:update:${deckId}`);
        };
    }, [socket, deckId]);
    const draw = () => {
        if (deckCards.length === 0)
            return;
        socket.emit("deck:draw", { deckId, playerId });
    };
    const shuffle = () => socket.emit("deck:shuffle", { deckId });
    const resetDeck = () => socket.emit("deck:reset", { deckId });
    return (_jsxs("section", { className: styles.deckSection, children: [_jsx("h3", { style: { marginBottom: "6px" }, children: name }), _jsxs("div", { className: styles.deckControls, children: [_jsx("button", { onClick: shuffle, children: "\u30B7\u30E3\u30C3\u30D5\u30EB" }), _jsx("button", { onClick: resetDeck, children: "\u5C71\u672D\u306B\u623B\u3059" })] }), _jsxs("div", { className: styles.deckWrapper, children: [_jsx("div", { className: styles.deckContainer, onClick: draw, children: deckCards.map((c, i) => (_jsx("div", { className: styles.deckCard, style: { zIndex: deckCards.length - i, transform: `translate(${i * 0.5}px, ${i * 0.5}px)` } }, c.id))) }), _jsx("div", { className: styles.deckContainer, children: drawnCards.map((c, i) => (_jsx("div", { className: styles.deckCardFront, style: { zIndex: i + 1, transform: `translate(${i * 0.5}px, ${i * 0.5}px)` }, children: c.name }, c.id))) })] })] }));
}
