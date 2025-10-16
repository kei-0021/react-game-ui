// src/components/Timer.tsx
import { useEffect, useState } from "react";
import { Socket } from "socket.io-client";

type TimerProps = {
  socket?: Socket | null;
  onFinish?: () => void;
  roomId?: string; // ルーム対応用
};

export default function Timer({ socket = null, onFinish, roomId }: TimerProps) {
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  useEffect(() => {
    if (!socket || !roomId) return;

    const handleStart = (data: { duration: number; roomId: string }) => {
      if (data.roomId !== roomId) return; // 他のルームのイベントは無視
      setTimeLeft(data.duration);
    };

    const handleUpdate = (data: { remaining: number; roomId: string }) => {
      if (data.roomId !== roomId) return;
      setTimeLeft(data.remaining);
      if (data.remaining <= 0) onFinish?.();
    };

    socket.on("timer:start", handleStart);
    socket.on("timer:update", handleUpdate);

    return () => {
      socket.off("timer:start", handleStart);
      socket.off("timer:update", handleUpdate);
    };
  }, [socket, roomId, onFinish]);

  const start = () => {
    if (!socket || !roomId) return;
    socket.emit("timer:start", { duration: 30, roomId }); // ルームID付き
  };

  return (
    <div
      style={{
        width: "300px",
        height: "80px",
        border: "2px solid #333",
        borderRadius: "8px",
        padding: "8px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f9f9f9",
        boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
        fontFamily: "sans-serif",
      }}
    >
      <div
        style={{
          fontSize: "1.5rem",
          fontWeight: "bold",
          color:
            timeLeft !== null
              ? timeLeft <= 6
                ? "red"
                : timeLeft <= 15
                ? "orange"
                : "green"
              : "gray",
          transition: "color 0.5s ease",
        }}
      >
        残り時間: {timeLeft ?? "-"}s
      </div>

      <div style={{ marginTop: "6px" }}>
        <button onClick={start} style={{ marginRight: "4px" }}>開始</button>
      </div>
    </div>
  );
}
