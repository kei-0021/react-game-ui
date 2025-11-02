import { CSSProperties, useEffect, useMemo, useRef, useState } from "react";
import { Socket } from "socket.io-client";
import { DiceId, RoomId } from "../types/definition.js";

type DiceProps = {
  socket?: Socket | null;
  diceId: DiceId;
  roomId: RoomId; 
  sides?: number;
  onRoll?: (value: number) => void;
};

export default function Dice({ sides = 6, socket = null, diceId, roomId, onRoll }: DiceProps) {
  const [value, setValue] = useState<number | null>(null);
  const [rolling, setRolling] = useState(false);
  const animRef = useRef<NodeJS.Timeout | null>(null);

  // 💡 サーバーからロール結果を受け取るイベント名をroomIdに基づいて構築
  const rollEventName = useMemo(() => `dice:rolled:${roomId}:${diceId}`, [roomId, diceId]);

  useEffect(() => {
    if (!socket || !roomId) return;

    const handleRoll = (rolledValue: number) => {
      setRolling(true);

      const rollDuration = 1000;
      const interval = 50;
      let count = 0;
      const times = rollDuration / interval;

      // アニメーション
      animRef.current = setInterval(() => {
        const animValue = Math.floor(Math.random() * sides) + 1;
        setValue(animValue);
        count++;
        if (count >= times) {
          clearInterval(animRef.current!);
          animRef.current = null;
          setValue(rolledValue);
          setRolling(false);
          // ロール完了時のコールバックを呼び出し
          onRoll?.(rolledValue);
        }
      }, interval);
    };

    // 💡 RoomIDを含むイベント名でリスナーを設定
    socket.on(rollEventName, handleRoll);
    
    return () => {
      // 💡 RoomIDを含むイベント名でリスナーを解除
      socket.off(rollEventName, handleRoll);
      if (animRef.current) clearInterval(animRef.current);
    };
  }, [socket, sides, diceId, roomId, onRoll, rollEventName]);

  const roll = () => {
    if (!socket || rolling) return;
    
    // 💡 サーバーに送信するペイロードに roomId を追加
    socket.emit("dice:roll", { 
        roomId, 
        diceId, 
        sides 
    });
  };
  
  const diceStyle: CSSProperties = {
    width: "80px",
    height: "80px",
    border: "2px solid #333",
    borderRadius: "8px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "2rem",
    fontWeight: "bold",
    // 💡 ロール中はカーソルを変更
    cursor: rolling ? "not-allowed" : "pointer",
    userSelect: "none",
    // 💡 ロール中も背景色を白に固定
    backgroundColor: "#fff", 
    color: "#333",
    // 💡 ロール中も影を固定
    boxShadow: "0 4px 6px rgba(0,0,0,0.3)", 
    transition: "all 0.2s",
    fontFamily: 'Inter, sans-serif'
  }

  return (
    <div
      style={diceStyle}
      onClick={roll}
    >
      <span style={{ fontSize: "1em" }}>{value ?? "🎲"}</span>
    </div>
  );
}