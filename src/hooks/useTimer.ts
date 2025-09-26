// src/hooks/useTimer.ts
import { useEffect, useState } from "react";
import { Socket } from "socket.io-client";

export function useTimer(socket: Socket | null) {
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  useEffect(() => {
    if (!socket) return; // socket が存在しない場合は何もしない

    let interval: number;

    const handleStart = (duration: number) => {
      setTimeLeft(duration);
      let t = duration;

      interval = window.setInterval(() => {
        t--;
        setTimeLeft(t);
        if (t <= 0) window.clearInterval(interval);
      }, 1000);
    };

    socket.on("timer:start", handleStart);

    return () => {
      socket.off("timer:start", handleStart);
      window.clearInterval(interval);
    };
  }, [socket]);

  const start = (duration: number) => {
    if (socket) socket.emit("timer:start", duration);
  };

  return { timeLeft, start };
}
