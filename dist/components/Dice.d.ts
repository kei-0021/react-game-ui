import { DiceId, RoomId } from '@/types/definition.js';
import { ReactNode } from 'react';
import { Socket } from 'socket.io-client';
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
export declare function Dice({ socket, diceId, roomId, sides, title, onRoll, customFaces, tooltipText }: DiceProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=Dice.d.ts.map