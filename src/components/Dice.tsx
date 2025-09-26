// src/components/Dice.tsx
import { useState } from "react";

type DiceProps = {
  sides?: number; // サイコロの面数（デフォルト6）
  onRoll?: (value: number) => void; // 出た目を受け取るコールバック
};

export default function Dice({ sides = 6, onRoll }: DiceProps) {
  const [value, setValue] = useState<number | null>(null);
  const [rolling, setRolling] = useState(false);

  const roll = () => {
    setRolling(true);
    const rollDuration = 500; // 500ms ころころアニメーション
    const interval = 50;
    const times = rollDuration / interval;
    let count = 0;

    const timer = setInterval(() => {
      setValue(Math.floor(Math.random() * sides) + 1);
      count++;
      if (count >= times) {
        clearInterval(timer);
        setRolling(false);
        onRoll?.(value ?? 1);
      }
    }, interval);
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
      onClick={() => !rolling && roll()}
    >
      {value ?? "🎲"}
    </div>
  );
}
