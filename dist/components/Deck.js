import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// src/components/Deck.tsx
import * as React from "react";
import cardStyles from "./Card.module.css";
import deckStyles from "./Deck.module.css";
const CardContent = ({ card }) => {
    if (!card.isFaceUp)
        return null;
    if (card.frontImage) {
        return (_jsx("img", { src: card.frontImage, alt: card.name, className: deckStyles.cardImage }));
    }
    return (_jsx("div", { className: deckStyles.cardNameWrapper, children: _jsx("strong", { className: deckStyles.cardNameText, children: card.name }) }));
};
export default function Deck({ socket, roomId, deckId, name, playerId = null, }) {
    const [deckCards, setDeckCards] = React.useState([]);
    const [drawnCards, setDrawnCards] = React.useState([]);
    const [discardPile, setDiscardPile] = React.useState([]);
    const [isDiscardHovered, setIsDiscardHovered] = React.useState(false);
    React.useEffect(() => {
        socket.on(`deck:init:${roomId}:${deckId}`, (data) => {
            setDeckCards(data.currentDeck.map((c) => ({ ...c, deckId })));
            setDrawnCards(data.drawnCards.map((c) => ({ ...c, deckId })));
            setDiscardPile(data.discardPile.map((c) => ({ ...c, deckId })));
        });
        socket.on(`deck:update:${roomId}:${deckId}`, (data) => {
            setDeckCards(data.currentDeck.map((c) => ({ ...c, deckId })));
            setDrawnCards(data.drawnCards.map((c) => ({ ...c, deckId })));
            setDiscardPile(data.discardPile.map((c) => ({ ...c, deckId })));
        });
        return () => {
            socket.off(`deck:init:${roomId}:${deckId}`);
            socket.off(`deck:update:${roomId}:${deckId}`);
        };
    }, [socket, roomId, deckId]);
    const draw = () => {
        if (deckCards.length === 0)
            return;
        const cardToDraw = deckCards[0];
        const drawLocation = cardToDraw?.drawLocation || "hand";
        const requestData = {
            roomId,
            deckId,
            drawLocation,
        };
        if (drawLocation === "hand" && playerId) {
            requestData.playerId = playerId;
        }
        socket.emit("deck:draw", requestData);
    };
    const shuffle = () => socket.emit("deck:shuffle", { roomId, deckId });
    const resetDeck = () => socket.emit("deck:reset", { roomId, deckId });
    return (_jsxs("section", { className: cardStyles.deckSection, children: [_jsx("h3", { className: deckStyles.deckTitle, children: name }), _jsxs("div", { className: cardStyles.deckControls, children: [_jsx("button", { onClick: shuffle, children: "\u30B7\u30E3\u30C3\u30D5\u30EB" }), _jsx("button", { onClick: resetDeck, children: "\u5C71\u672D\u306B\u623B\u3059" })] }), _jsxs("div", { className: `${cardStyles.deckWrapper} ${deckStyles.deckWrapperFlex}`, children: [_jsx("div", { className: cardStyles.deckContainer, onClick: draw, children: deckCards.map((c, i) => (_jsx("div", { className: cardStyles.deckCard, style: {
                                zIndex: deckCards.length - i,
                                transform: `translate(${i * 0.3}px, ${i * 0.3}px)`,
                                backgroundColor: c.backColor,
                            } }, c.id))) }), _jsx("div", { className: cardStyles.deckContainer, children: drawnCards.map((c, i) => (_jsx("div", { className: cardStyles.deckCardFront, style: {
                                zIndex: i + 1,
                                transform: `translate(${i * 0.3}px, ${i * 0.3}px)`,
                            }, children: _jsx(CardContent, { card: c }) }, c.id))) }), _jsx("div", { className: `${cardStyles.deckContainer} ${cardStyles.discardPileWrapper}`, children: discardPile.map((c, i) => (_jsxs("div", { className: cardStyles.deckCardFront, style: {
                                zIndex: i + 1,
                                transform: `translate(${i * -0.3}px, ${i * -0.3}px)`,
                                pointerEvents: i === discardPile.length - 1 ? "auto" : "none",
                            }, onMouseEnter: () => i === discardPile.length - 1 && setIsDiscardHovered(true), onMouseLeave: () => i === discardPile.length - 1 && setIsDiscardHovered(false), children: [_jsx(CardContent, { card: c }), i === discardPile.length - 1 && c.description && (_jsx("span", { className: `${cardStyles.tooltip} ${deckStyles.tooltipBase}`, style: {
                                        visibility: isDiscardHovered ? "visible" : "hidden",
                                        opacity: isDiscardHovered ? 1 : 0,
                                    }, children: c.description }))] }, c.id))) })] })] }));
}
