import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import styles from "./Card.module.css";
export default function ScoreBoard({ socket, players, currentPlayerId }) {
    const nextTurn = () => socket.emit("game:next-turn");
    const displayedPlayers = players.map(p => ({
        ...p,
        score: p.score ?? 0,
        cards: p.cards ?? [],
    }));
    return (_jsxs("div", { style: { padding: "12px", border: "1px solid #ccc", borderRadius: "8px" }, children: [_jsx("h2", { children: "Scoreboard" }), _jsx("ul", { style: { listStyle: "none", padding: 0 }, children: displayedPlayers.map(player => (_jsxs("li", { style: {
                        padding: "6px 12px",
                        marginBottom: "6px",
                        borderRadius: "4px",
                        backgroundColor: player.id === currentPlayerId ? "#a0e7ff" : "#f5f5f5",
                        fontWeight: player.id === currentPlayerId ? "bold" : "normal",
                    }, children: [_jsxs("div", { style: { display: "flex", justifyContent: "space-between" }, children: [_jsx("span", { children: player.name }), _jsx("span", { children: player.score })] }), _jsx("div", { style: { display: "flex", gap: "6px", marginTop: "6px", flexWrap: "wrap" }, children: player.cards.map(card => (_jsxs("div", { className: styles.card, style: { position: "relative", cursor: "pointer" }, onMouseEnter: e => {
                                    const tooltip = e.currentTarget.querySelector(`.${styles.tooltip}`);
                                    if (!tooltip)
                                        return;
                                    tooltip.style.display = "block";
                                }, onMouseLeave: e => {
                                    const tooltip = e.currentTarget.querySelector(`.${styles.tooltip}`);
                                    if (!tooltip)
                                        return;
                                    tooltip.style.display = "none";
                                }, onClick: () => {
                                    console.log("カードの効果発動:", card.name);
                                    socket.emit("card:play", { deckId: card.deckId, cardId: card.id, playerId: player.id });
                                }, children: [card.name, card.description && _jsx("span", { className: styles.tooltip, children: card.description })] }, card.id))) })] }, player.id))) }), _jsx("button", { onClick: nextTurn, children: "\u6B21\u306E\u30BF\u30FC\u30F3" })] }));
}
