/// <reference types="vite/client" />
import { DiceId, RoomId } from '@/types/definition.js';
import { ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { Socket } from 'socket.io-client';
import styles from './Dice.module.css';

import dice1Image from '../assets/dice-1.png';
import dice2Image from '../assets/dice-2.png';
import dice3Image from '../assets/dice-3.png';
import dice4Image from '../assets/dice-4.png';
import dice5Image from '../assets/dice-5.png';
import dice6Image from '../assets/dice-6.png';

const defaultDiceImages: { [key: number]: string } = {
  1: dice1Image,
  2: dice2Image,
  3: dice3Image,
  4: dice4Image,
  5: dice5Image,
  6: dice6Image,
};

type DiceProps = {
  socket?: Socket | null;
  diceId: DiceId;
  roomId: RoomId;
  title?: string;
  sides?: number;
  onRoll?: (value: number) => void;
  customFaces?: ReactNode[];
  tooltipText?: string;
};

export default function Dice({
  sides = 6,
  socket = null,
  diceId,
  roomId,
  title,
  onRoll,
  customFaces,
  tooltipText,
}: DiceProps) {
  const [value, setValue] = useState<number>(1);
  const [rolling, setRolling] = useState(false);
  const animRef = useRef<NodeJS.Timeout | null>(null);

  const rollEventName = useMemo(() => `dice:rolled:${roomId}:${diceId}`, [roomId, diceId]);

  useEffect(() => {
    if (!socket || !roomId) return;

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

    socket.on(rollEventName, handleRoll);

    return () => {
      socket.off(rollEventName, handleRoll);
      if (animRef.current) clearInterval(animRef.current);
    };
  }, [socket, sides, diceId, roomId, onRoll, rollEventName]);

  const roll = () => {
    if (!socket || rolling) return;
    socket.emit('dice:roll', { roomId, diceId, sides });
  };

  const renderDiceFace = () => {
    if (customFaces && customFaces[value - 1]) {
      return <div className={styles.faceContainer}>{customFaces[value - 1]}</div>;
    }

    if (value >= 1 && value <= 6 && defaultDiceImages[value]) {
      return <img src={defaultDiceImages[value]} alt={`Dice face ${value}`} className={styles.faceImage} />;
    }

    return <span className={styles.defaultText}>{value}</span>;
  };

  return (
    <div className={styles.diceWrapper}>
      {title && <div className={styles.diceTitle}>{title}</div>}
      <div className={`${styles.dice} ${rolling ? styles.diceRolling : styles.diceNotRolling}`} onClick={roll}>
        {renderDiceFace()}
        {tooltipText && <div className={styles.tooltip}>{tooltipText}</div>}
      </div>
    </div>
  );
}
