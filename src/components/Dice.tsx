import { DiceId, RoomId } from "@/types/definition.js"; // エイリアスはTypescriptファイルには残す
import { CSSProperties, useEffect, useMemo, useRef, useState } from "react";
import { Socket } from "socket.io-client";

// 💡 修正 1: 画像ファイルのインポートを、Rollupが確実に解決できる「相対パス」に修正
// Dice.tsxは src/components/ にあるため、assetsは一つ上の階層(../)
import dice1Image from "../assets/dice-1.png";
import dice2Image from "../assets/dice-2.png";
import dice3Image from "../assets/dice-3.png";
import dice4Image from "../assets/dice-4.png";
import dice5Image from "../assets/dice-5.png";
import dice6Image from "../assets/dice-6.png";

// 画像オブジェクトを格納するマップ
const diceImages: { [key: number]: string } = {
  1: dice1Image,
  2: dice2Image,
  3: dice3Image,
  4: dice4Image,
  5: dice5Image,
  6: dice6Image,
};

// 💡 2. 画像を用意している最大面数
const MAX_IMAGE_SIDE = 6;


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

  const rollEventName = useMemo(() => `dice:rolled:${roomId}:${diceId}`, [roomId, diceId]);

  // ... (useEffectのロジックは変更なし)
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
          onRoll?.(rolledValue);
        }
      }, interval);
    };

    socket.on(rollEventName, handleRoll);
    
    return () => {
      socket.off(rollEventName, handleRoll);
      if (animRef.current) clearInterval(animRef.current);
    };
  }, [socket, sides, diceId, roomId, onRoll, rollEventName]);
  // ... (useEffectのロジックはここまで)


  const roll = () => {
    if (!socket || rolling) return;
    
    socket.emit("dice:roll", { 
        roomId, 
        diceId, 
        sides 
    });
  };
  
  // 💡 3. value に応じて表示内容を切り替える関数を定義
  const renderDiceFace = () => {
    if (value === null) {
      // 初期値
      return <span style={{ fontSize: "1em" }}>{"🎲"}</span>;
    }

    // 1. 画像が用意されている範囲 (1～6) かつ、その画像がインポートされている場合
    if (value >= 1 && value <= MAX_IMAGE_SIDE && diceImages[value]) {
      const imageSrc = diceImages[value];
      return (
        <img 
          src={imageSrc} 
          alt={`Dice face showing ${value}`} 
          // 画像をダイスコンポーネントのサイズにフィットさせる
          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
        />
      );
    }

    // 2. 画像がない場合（7以上の値や、その他の画像ファイルがない場合）は数字を表示
    return <span style={{ fontSize: "1em" }}>{value}</span>;
  };


  const diceStyle: CSSProperties = {
    // ... (CSSPropertiesは変更なし)
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
    cursor: rolling ? "not-allowed" : "pointer",
    userSelect: "none",
    backgroundColor: "#fff", 
    color: "#333",
    boxShadow: "0 4px 6px rgba(0,0,0,0.3)", 
    transition: "all 0.2s",
    fontFamily: 'Inter, sans-serif'
  }

  return (
    <div
      style={diceStyle}
      onClick={roll}
    >
      {renderDiceFace()}
    </div>
  );
}
