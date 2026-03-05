import { Player } from '@/types/player.js';
import { Socket } from 'socket.io-client';
import { PlayerId, RoomId } from '../types/definition.js';
/**
 * スコアボードコンポーネント
 * プレイヤーの一覧、現在のターン、各プレイヤーのスコアやトークン数を表示する
 * @param {Socket} socket - Socket.ioのインスタンス
 * @param {Player[]} players - ルームに参加しているプレイヤーのリスト
 * @param {string | null} currentPlayerId - 現在の手番のプレイヤーID
 * @param {string | null} myPlayerId - ローカルプレイヤーのID
 * @param {string} roomId - 現在のルームID
 * @param {number} playCardLimit - 1ターンにプレイ可能なカードの上限枚数
 * @param {boolean} autoNextTurnOnCardPlay=false - カードプレイ時に自動でターンを終了するかどうか
 * @param {boolean} roundSkip=false - ラウンドスキップボタンの表示・非表示
 * @param {booleam} isDebug=false - スコアを手動で増減できるようにするかどうか (デバッグ用)
 */
export declare function ScoreBoard({ socket, players, currentPlayerId, myPlayerId, roomId, playCardLimit, autoNextTurnOnCardPlay, roundSkip, isDebug, }: {
    socket: Socket;
    players: Player[];
    currentPlayerId?: PlayerId | null;
    myPlayerId: PlayerId | null;
    roomId: RoomId;
    playCardLimit?: number;
    autoNextTurnOnCardPlay?: boolean;
    roundSkip?: boolean;
    isDebug?: boolean;
}): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=ScoreBoard.d.ts.map