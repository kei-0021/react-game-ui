import { createServer } from "http";
import { Server } from "socket.io";

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: "*",
  },
});

let deck = [
  { id: "1", name: "1", description: "1マス進む" },
  { id: "2", name: "2", description: "2マス進む" },
  { id: "3", name: "3", description: "3マス進む" },
];
let drawnCards = [];

function shuffleDeck() {
  deck = deck.sort(() => Math.random() - 0.5);
}

io.on("connection", (socket) => {
  console.log("クライアント接続:", socket.id);

  // 初期山札を送る
  socket.emit("deck:init", deck);

  // カードを引く
  socket.on("deck:draw", () => {
    console.log("deck:draw 受信");
    if (deck.length > 0) {
      const card = deck.shift();
      drawnCards.push(card);
      io.emit("deck:drawn", card);
    }
  });

  // 山札をシャッフル
  socket.on("deck:shuffle", () => {
    shuffleDeck();
    io.emit("deck:init", deck);
  });

  // サイコロを振る
  socket.on("dice:roll", (sides) => {
    console.log("dice:rolled")
    const value = Math.floor(Math.random() * sides) + 1;
    io.emit("dice:rolled", value); // ← dice:result → dice:rolled に変更
  });

  // タイマー開始s
  socket.on("timer:start", (duration) => {
    let remaining = duration;
    io.emit("timer:start", duration);

    const interval = setInterval(() => {
      remaining--;
      io.emit("timer:update", remaining);
      if (remaining <= 0) clearInterval(interval);
    }, 1000);
  });

  socket.on("disconnect", () => {
    console.log("クライアント切断:", socket.id);
  });
});

httpServer.listen(3000, () => {
  console.log("Socket.IO サーバーがポート3000で起動しました");
});
