import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useRef, useState } from 'react';
import styles from './Dice.module.css';
import dice1Image from '../assets/dice-1.png';
import dice2Image from '../assets/dice-2.png';
import dice3Image from '../assets/dice-3.png';
import dice4Image from '../assets/dice-4.png';
import dice5Image from '../assets/dice-5.png';
import dice6Image from '../assets/dice-6.png';
const defaultDiceImages = {
    1: dice1Image,
    2: dice2Image,
    3: dice3Image,
    4: dice4Image,
    5: dice5Image,
    6: dice6Image,
};
/**
 * ダイス（サイコロ）の振出、アニメーション、およびリアルタイム同期を管理するコンポーネント
 * @param {Socket | null} [socket=null] - サーバーと同期するためのSocket.ioインスタンス
 * @param {string} diceId - ダイスを一意に識別するためのID（同期に使用）
 * @param {RoomId} roomId - 現在のルームID
 * @param {number} [sides=6] - ダイスの面の数。デフォルトは6面
 * @param {string} [title] - ダイス付近に表示するラベルやタイトル
 * @param {(value: number) => void} [onRoll] - ダイスが確定した際に実行されるコールバック関数
 * @param {ReactNode[]} [customFaces] - 数値の代わりに表示するカスタム要素（画像やアイコンなど）の配列
 * @param {string} [tooltipText] - ホバー時に表示する説明テキスト
 */
export function Dice({ socket = null, diceId, roomId, sides = 6, title, onRoll, customFaces, tooltipText }) {
    const [value, setValue] = useState(1);
    const [rolling, setRolling] = useState(false);
    const animRef = useRef(null);
    const rollEventName = useMemo(() => `dice:update:${diceId}`, [diceId]);
    useEffect(() => {
        if (!socket || !roomId)
            return;
        const handleRoll = (data) => {
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
                    clearInterval(animRef.current);
                    animRef.current = null;
                    setValue(data.value);
                    setRolling(false);
                    onRoll?.(data.value);
                }
            }, interval);
        };
        socket.on(rollEventName, handleRoll);
        return () => {
            socket.off(rollEventName, handleRoll);
            if (animRef.current)
                clearInterval(animRef.current);
        };
    }, [socket, sides, diceId, roomId, onRoll, rollEventName]);
    const roll = () => {
        if (!socket || rolling)
            return;
        const requestData = { roomId, diceId, sides };
        socket.emit('dice:roll', requestData);
    };
    const renderDiceFace = () => {
        if (customFaces && customFaces[value - 1]) {
            return _jsx("div", { className: styles.faceContainer, children: customFaces[value - 1] });
        }
        if (value >= 1 && value <= 6 && defaultDiceImages[value]) {
            return _jsx("img", { src: defaultDiceImages[value], alt: `Dice face ${value}`, className: styles.faceImage });
        }
        return _jsx("span", { className: styles.defaultText, children: value });
    };
    return (_jsxs("div", { className: styles.diceWrapper, children: [title && _jsx("div", { className: styles.diceTitle, children: title }), _jsxs("div", { className: `${styles.dice} ${rolling ? styles.diceRolling : styles.diceNotRolling}`, onClick: roll, children: [renderDiceFace(), tooltipText && _jsx("div", { className: styles.tooltip, children: tooltipText })] })] }));
}
