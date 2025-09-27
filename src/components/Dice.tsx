// src/components/Dice.tsx
import { useEffect, useRef, useState } from "react";
import { Socket } from "socket.io-client";

export type DiceId = string;

type DiceProps = {
  socket?: Socket | null;
  diceId: DiceId;
  sides?: number;
  onRoll?: (value: number) => void;
};

export default function Dice({ sides = 6, socket = null, diceId, onRoll }: DiceProps) {
  const [value, setValue] = useState<number | null>(null);
  const [rolling, setRolling] = useState(false);
  const animRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!socket) return;

    const handleRoll = (rolledValue: number) => {
      setRolling(true);

      const rollDuration = 1000;
      const interval = 50;
      let count = 0;
      const times = rollDuration / interval;

      animRef.current = setInterval(() => {
        const animValue = Math.floor(Math.random() * sides) + 1;
        setValue(animValue);
        count++;
        if (count >= times) {
          clearInterval(animRef.current!);
          animRef.current = null;
          setValue(rolledValue);
          setRolling(false);
          onRoll?.(rolledValue);
        }
      }, interval);
    };

    socket.on(`dice:rolled:${diceId}`, handleRoll);
    return () => {
      socket.off(`dice:rolled:${diceId}`, handleRoll);
      if (animRef.current) clearInterval(animRef.current);
    };
  }, [socket, sides, diceId, onRoll]);

  const roll = () => {
    if (!socket || rolling) return;
    socket.emit("dice:roll", { diceId, sides });
  };

  return (
    <div
      style={{
        width: "80px",
        height: "80px",
        border: "2px solid #333",
        borderRadius: "8px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "2rem",
        fontWeight: "bold",
        cursor: rolling ? "not-allowed" : "pointer",
        userSelect: "none",
        backgroundColor: "#fff",
        boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
        transition: "transform 0.2s",
      }}
      onClick={roll}
    >
      {value ?? "🎲"}
    </div>
  );
}
