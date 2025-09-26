// src/components/Timer.tsx
import { useEffect, useState } from "react";

type TimerProps = {
  initialTime: number;
  onFinish?: () => void;
};

export default function Timer({ initialTime, onFinish }: TimerProps) {
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) return;
    if (timeLeft <= 0) {
      setRunning(false);
      onFinish?.();
      return;
    }

    const timerId = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timerId);
  }, [running, timeLeft, onFinish]);

  const start = () => setRunning(true);
  const stop = () => setRunning(false);
  const reset = () => setTimeLeft(initialTime);

  const getColor = () => {
    if (timeLeft <= initialTime * 0.2) return "red";
    if (timeLeft <= initialTime * 0.5) return "orange";
    return "green";
  };

  return (
    <div
      style={{
        width: "300px",               // 固定幅
        height: "80px",               // 固定高さ
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
          color: getColor(),
          transition: "color 0.5s ease",
        }}
      >
        残り時間: {timeLeft}s
      </div>

      <div style={{ marginTop: "6px" }}>
        <button onClick={start} style={{ marginRight: "4px" }}>開始</button>
        <button onClick={stop} style={{ marginRight: "4px" }}>停止</button>
        <button onClick={reset}>リセット</button>
      </div>
    </div>
  );
}
