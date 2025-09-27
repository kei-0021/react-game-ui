import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from "react";
import ReactDOM from "react-dom/client";
import Deck from "./components/Deck.js";
import DiceSocket from "./components/Dice.js";
import ScoreBoard from "./components/ScoreBoard.js";
import Timer from "./components/Timer.js";
import { cardEffects } from "./data/cardEffects.js";
import mainDeck from "./data/cards.json";
import lightDeck from "./data/lightCards.json";
import { useSocket } from "./hooks/useSocket.js";
export default function Game() {
    const socket = useSocket("http://127.0.0.1:3000");
    const [players, setPlayers] = React.useState([]);
    const [currentPlayerId, setCurrentPlayerId] = React.useState(null);
    React.useEffect(() => {
        if (!socket)
            return;
        // プレイヤー情報
        socket.on("players:update", setPlayers);
        socket.on("game:turn", setCurrentPlayerId);
        // 初期デッキ送信
        const allDecks = [
            { deckId: "main", name: "イベントカード", cards: mainDeck },
            { deckId: "light", name: "光カード", cards: lightDeck }
        ];
        allDecks.forEach(deck => {
            deck.cards = deck.cards.map(c => ({
                ...c,
                onPlay: cardEffects[c.name] || (() => { }),
                location: "deck"
            }));
            socket.emit("deck:add", deck);
        });
        allDecks.forEach(deck => socket.emit("deck:add", deck));
        return () => {
            socket.off("players:update");
            socket.off("game:turn");
        };
    }, [socket]);
    if (!socket)
        return _jsx("p", { children: "\u63A5\u7D9A\u4E2D\u2026" });
    return (_jsxs("div", { children: [_jsx(Deck, { socket: socket, deckId: "main", name: "\u30A4\u30D9\u30F3\u30C8\u30AB\u30FC\u30C9", playerId: currentPlayerId }), _jsx(Deck, { socket: socket, deckId: "light", name: "\u5149\u30AB\u30FC\u30C9", playerId: currentPlayerId }), _jsx(DiceSocket, { socket: socket, diceId: "0", sides: 6 }), _jsx(DiceSocket, { socket: socket, diceId: "1", sides: 2 }), _jsx(Timer, { socket: socket, onFinish: () => console.log("タイマー終了！") }), _jsx(ScoreBoard, { socket: socket, players: players, currentPlayerId: currentPlayerId })] }));
}
ReactDOM.createRoot(document.getElementById("root")).render(_jsx(React.StrictMode, { children: _jsx(Game, {}) }));
