// src/components/Timer.tsx
import { useEffect, useState } from "react";
import { Socket } from "socket.io-client";

type TimerProps = {
  socket?: Socket | null;
  initialDuration: number; 
  onFinish?: () => void;
  roomId?: string; // ルーム対応用
};

export default function Timer({ socket = null, initialDuration, onFinish, roomId }: TimerProps) {
  // 💡 修正2: 初期状態を null ではなく initialDuration に基づいて設定
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
      // クライアント側で 0 になったことを検出しても、onFinish はサーバーからの終了通知に任せる
      // if (data.remaining <= 0) onFinish?.(); 
    };

    // 💡 修正3: サーバーから終了通知を受け取った場合のハンドラを追加
    const handleFinish = (data: { roomId: string }) => {
        if (data.roomId !== roomId) return;
        setTimeLeft(0);
        onFinish?.(); // サーバーの終了通知に基づいてコールバックを発火
    };

    socket.on("timer:start", handleStart);
    socket.on("timer:update", handleUpdate);
    socket.on("timer:finish", handleFinish); // 💡 終了イベントのリスナーを追加

    return () => {
      socket.off("timer:start", handleStart);
      socket.off("timer:update", handleUpdate);
      socket.off("timer:finish", handleFinish); // 💡 クリーンアップ
    };
  }, [socket, roomId, onFinish]);

  const start = () => {
    if (!socket || !roomId || initialDuration <= 0) return;
    
    // 💡 修正4: プロパティで受け取った initialDuration をサーバーに送信
    socket.emit("timer:start", { duration: initialDuration, roomId }); // ルームIDと初期時間付き
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
        残り時間: {timeLeft === 0 ? "終了" : timeLeft ?? "-"}s
      </div>

      <div style={{ marginTop: "6px" }}>
        <button onClick={start} style={{ marginRight: "4px" }}>タイマー開始 ({initialDuration}s)</button>
      </div>
    </div>
  );
}