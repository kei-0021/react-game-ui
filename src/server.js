import { createServer } from "http";
import { Server } from "socket.io";
import deck from "./data/cards.json" assert { type: "json" };

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: { origin: "*" },
});

let currentDeck = [...deck];  // 山札（まだ引かれていないカード）
let drawnCards = [];          // 引いたカード

function shuffleDeck() {
  // 山札だけをシャッフル
  for (let i = currentDeck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [currentDeck[i], currentDeck[j]] = [currentDeck[j], currentDeck[i]];
  }
}

io.on("connection", (socket) => {
  console.log("クライアント接続:", socket.id);

  // 初期山札を送る
  socket.emit("deck:init", { currentDeck, drawnCards });

  // カードを引く
  socket.on("deck:draw", () => {
    console.log("deck:draw 受信");
    if (currentDeck.length > 0) {
      const card = currentDeck.shift();
      drawnCards.push(card);
      io.emit("deck:update", { currentDeck, drawnCards });
    }
  });

  // 山札だけをシャッフル
  socket.on("deck:shuffle", () => {
    console.log("deck:shuffle 受信");
    shuffleDeck();
    io.emit("deck:update", { currentDeck, drawnCards });
  });

  // 引いたカードを山札に戻す
  socket.on("deck:reset", () => {
    console.log("deck:reset 受信");
    currentDeck = [...currentDeck, ...drawnCards];
    drawnCards = [];
    shuffleDeck();
    io.emit("deck:update", { currentDeck, drawnCards });
  });

  // サイコロ
  socket.on("dice:roll", (sides) => {
    console.log("dice:roll 受信");
    const value = Math.floor(Math.random() * sides) + 1;
    io.emit("dice:rolled", value);
  });

  // タイマー
  socket.on("timer:start", (duration) => {
    console.log(`timer:start 受信, duration: ${duration}s`);
    let remaining = duration;
    io.emit("timer:start", duration);

    const interval = setInterval(() => {
      remaining--;
      console.log(`timer:update: ${remaining}s`);
      io.emit("timer:update", remaining);
      if (remaining <= 0) {
        clearInterval(interval);
        io.emit("timer:end");
      }
    }, 1000);
  });

  socket.on("disconnect", () => {
    console.log("クライアント切断:", socket.id);
  });
});

httpServer.listen(3000, () => {
  console.log("Socket.IO サーバーがポート3000で起動しました");
});
