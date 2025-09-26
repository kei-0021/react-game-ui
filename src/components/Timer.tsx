// src/components/Timer.tsx
import { useEffect, useState } from "react";
import { Socket } from "socket.io-client";

type TimerProps = {
  socket?: Socket | null;
  onFinish?: () => void;
};

export default function Timer({ socket = null, onFinish }: TimerProps) {
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  useEffect(() => {
    if (!socket) return;

    const handleStart = (duration: number) => {
      setTimeLeft(duration);
    };

    const handleUpdate = (remaining: number) => {
      setTimeLeft(remaining);
      if (remaining <= 0) onFinish?.();
    };

    socket.on("timer:start", handleStart);
    socket.on("timer:update", handleUpdate);

    return () => {
      socket.off("timer:start", handleStart);
      socket.off("timer:update", handleUpdate);
    };
  }, [socket, onFinish]);

  const start = () => {
    if (!socket) return;
    socket.emit("timer:start", 30); // 例: 30秒
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
