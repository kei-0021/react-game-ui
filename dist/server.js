import { createServer } from "http";
import { Server } from "socket.io";

const decks = {};
const drawnCards = {};

let players = [];
let currentTurnIndex = 0;

const httpServer = createServer();
const io = new Server(httpServer, { cors: { origin: "*" } });

function addScore(playerId, points) {
  const player = players.find(p => p.id === playerId);
  if (!player) return;
  player.score = (player.score || 0) + points;
  io.emit("players:update", players);
}

function shuffleDeck(deckId) {
  if (!decks[deckId]) return;
  const currentDeck = decks[deckId].filter(c => c.location === "deck");
  for (let i = currentDeck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [currentDeck[i], currentDeck[j]] = [currentDeck[j], currentDeck[i]];
  }
  decks[deckId] = currentDeck.concat(decks[deckId].filter(c => c.location !== "deck"));
}

io.on("connection", socket => {
  console.log("クライアント接続:", socket.id);

  players.push({ id: socket.id, name: `Player ${players.length + 1}`, cards: [], score: 0 });
  io.emit("players:update", players);
  io.emit("game:turn", players[currentTurnIndex]?.id);

  socket.on("deck:add", ({ deckId, name, cards }) => {
    if (decks[deckId]) return;

    decks[deckId] = cards.map(c => ({
      ...c,
      deckId,
      location: "deck"
    }));

    drawnCards[deckId] = [];

    console.log(`[${name}デッキ]の初期化完了`);

    io.emit(`deck:init:${deckId}`, {
      currentDeck: decks[deckId].filter(c => c.location === "deck"),
      drawnCards: drawnCards[deckId]
    });
  });

  socket.on("deck:draw", ({ deckId, playerId }) => {
    if (!decks[deckId]) return;
    const currentDeck = decks[deckId].filter(c => c.location === "deck");
    if (!currentDeck.length) return;
    const card = currentDeck.shift();
    if (!card) return;

    if (playerId) {
      const player = players.find(p => p.id === playerId);
      if (player) {
        player.cards = player.cards || [];
        card.location = "hand";
        player.cards.push(card);
      }
    } else {
      card.location = "field";
      drawnCards[deckId].push(card);
    }

    decks[deckId] = currentDeck.concat(decks[deckId].filter(c => c.location !== "deck"));

    io.emit(`deck:update:${deckId}`, {
      currentDeck: decks[deckId].filter(c => c.location === "deck"),
      drawnCards: drawnCards[deckId]
    });
    io.emit("players:update", players);
  });

  socket.on("deck:shuffle", ({ deckId }) => {
    if (!decks[deckId]) return;
    shuffleDeck(deckId);
    io.emit(`deck:update:${deckId}`, {
      currentDeck: decks[deckId].filter(c => c.location === "deck"),
      drawnCards: drawnCards[deckId]
    });
  });

  socket.on("deck:reset", ({ deckId }) => {
    if (!decks[deckId]) return;
    const fieldCards = decks[deckId].filter(c => c.location === "field");
    fieldCards.forEach(c => {
      c.location = "deck";
      drawnCards[deckId] = drawnCards[deckId].filter(d => d.id !== c.id);
    });
    shuffleDeck(deckId);
    io.emit(`deck:update:${deckId}`, {
      currentDeck: decks[deckId].filter(c => c.location === "deck"),
      drawnCards: drawnCards[deckId]
    });
  });

  socket.on("card:play", ({ deckId, cardId, playerId }) => {
    if (!decks[deckId]) return;
    const card = decks[deckId].find(c => c.id === cardId);
    if (!card) return;

    if (card.onPlay) card.onPlay({ playerId, addScore });

    if (playerId) {
      const player = players.find(p => p.id === playerId);
      if (player && player.cards) player.cards = player.cards.filter(c => c.id !== cardId);
    }

    card.location = "field";
    drawnCards[deckId].push(card);

    io.emit(`deck:update:${deckId}`, {
      currentDeck: decks[deckId].filter(c => c.location === "deck"),
      drawnCards: drawnCards[deckId]
    });
    io.emit("players:update", players);
  });

  socket.on("dice:roll", ({ diceId, sides }) => {
    const value = Math.floor(Math.random() * sides) + 1;
    io.emit(`dice:rolled:${diceId}`, value);
  });

  socket.on("timer:start", (duration) => {
    let remaining = duration;
    io.emit("timer:start", duration);
    const interval = setInterval(() => {
      remaining--;
      io.emit("timer:update", remaining);
      if (remaining <= 0) {
        clearInterval(interval);
        io.emit("timer:end");
      }
    }, 1000);
  });

  socket.on("game:next-turn", () => {
    currentTurnIndex = (currentTurnIndex + 1) % players.length;
    io.emit("game:turn", players[currentTurnIndex]?.id);
  });

  socket.on("disconnect", () => {
    players = players.filter(p => p.id !== socket.id);
    if (currentTurnIndex >= players.length) currentTurnIndex = 0;
    io.emit("game:turn", players[currentTurnIndex]?.id);
    io.emit("players:update", players);
  });
});

httpServer.listen(3000, () => {
  console.log("Socket.IO サーバーがポート3000で起動しました");
});
