import { CSSProperties, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { io, Socket } from "socket.io-client";
import Dice from "../../src/components/Dice.js";

const SERVER_URL = "http://127.0.0.1:4000";

// -------------------- useSocket --------------------
const useSocket = (url: string): Socket | null => {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const newSocket: Socket = io(url, { transports: ["websocket", "polling"] });

    newSocket.on("connect", () => console.log("Socket connected successfully."));
    newSocket.on("disconnect", (reason) => console.log("Socket disconnected:", reason));
    newSocket.on("connect_error", (err) => console.error("Socket connection error:", err));

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [url]);

  return socket;
};

// -------------------- GameRoom --------------------
interface Params {
  roomId?: string;
}

const cardStyle: CSSProperties = {
  padding: "20px",
  borderRadius: "12px",
  backgroundColor: "rgba(30, 50, 70, 0.8)",
  boxShadow: "0 8px 16px rgba(0, 0, 0, 0.5)",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "20px",
};

export default function GameRoom() {
  const { roomId } = useParams<{ roomId: string }>();
  const socket = useSocket(SERVER_URL);
  const [rollHistory, setRollHistory] = useState<number[]>([]);

  useEffect(() => {
    if (!socket || !roomId) return;

    // connect イベントで room:join を送信
    const handleConnect = () => {
      console.log("[CLIENT] connected:", socket.id);
      socket.emit("room:join", roomId);
      console.log("[CLIENT] room:join emitted", roomId);
    };

    socket.on("connect", handleConnect);

    // 任意の testEvent 受信
    socket.on("testEvent", (msg) => console.log("Received:", msg));

    return () => {
      socket.off("connect", handleConnect);
      if (socket.connected) socket.emit("room:leave", roomId);
    };
  }, [socket, roomId]);

  const handleDiceRoll = (value: number) => {
    setRollHistory((prev) => [...prev, value].slice(-5));
  };

  const fullScreenBackgroundStyle: CSSProperties = {
    minHeight: "100vh",
    backgroundColor: "#0a192f",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
    boxSizing: "border-box",
    fontFamily: "Inter, sans-serif",
    color: "white",
  };

  const titleStyle: CSSProperties = {
    textAlign: "center",
    color: "#8be9fd",
    textShadow: "0 0 10px rgba(139, 233, 253, 0.5)",
    marginBottom: "30px",
  };

  if (!roomId)
    return (
      <div style={fullScreenBackgroundStyle}>
        <h1 style={titleStyle}>Game Room Status</h1>
        <p>⚠️ ルームIDがURLから取得できませんでした。</p>
      </div>
    );

  if (!socket)
    return (
      <div style={fullScreenBackgroundStyle}>
        <h1 style={titleStyle}>Game Room Status: {roomId}</h1>
        <p>サーバーに接続中... (URL: {SERVER_URL})</p>
      </div>
    );

  return (
    <div style={fullScreenBackgroundStyle}>
      <h1 style={titleStyle}>ルーム: {roomId} - ダイス動作テスト</h1>
      <div style={cardStyle}>
        <h2>メインダイス (D6)</h2>
        <Dice socket={socket} diceId="main-dice" roomId={roomId} sides={6} onRoll={handleDiceRoll} />
        <div style={{ marginTop: "10px", fontSize: "0.9em" }}>
          <p>
            <strong>最新のロール結果:</strong> {rollHistory.length > 0 ? rollHistory[rollHistory.length - 1] : "N/A"}
          </p>
          <p style={{ color: "#aaa" }}>履歴: {rollHistory.join(", ")}</p>
        </div>
      </div>
    </div>
  );
}
