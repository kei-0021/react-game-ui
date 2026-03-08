import { Player } from '@/types/player.js';
import { Socket } from 'socket.io-client';
import { PlayerId, RoomId } from '../types/definition.js';
/**
 * スコアボードコンポーネント
 * プレイヤーの一覧、現在のターン、各プレイヤーのスコアやトークン数を表示する
 * @param {Socket} socket - Socket.ioのインスタンス
 * @param {string} roomId - 現在のルームID
 * @param {Player[]} players - ルームに参加しているプレイヤーのリスト
 * @param {string | null} currentPlayerId - 現在の手番のプレイヤーID
 * @param {string | null} myPlayerId - ローカルプレイヤーのID
 * @param {number} playCardLimit - 1ターンにプレイ可能なカードの上限枚数
 * @param {boolean} autoNextTurnOnCardPlay=false - カードプレイ時に自動でターンを終了するかどうか
 * @param {boolean} playCardButton=true - カードをプレイするボタンの表示・非表示
 * @param {boolean} holdButton=false - カードを一定期間ホールドしつつプレイするボタンの表示・非表示
 * @param {boolean} revealButton=false - カード公開ボタンの表示・非表示
 * @param {boolean} turnSkipButton=false - ターンスキップボタンの表示・非表示
 * @param {boolean} roundSkipButton=false - ラウンドスキップボタンの表示・非表示
 * @param {booleam} isDebug=false - スコアを手動で増減できるようにするかどうか (デバッグ用)
 * @param {booleam} enabled=true - 各種操作が有効かどうかのフラグ
 */
export declare function ScoreBoard({ socket, roomId, players, currentPlayerId, myPlayerId, playCardLimit, autoNextTurnOnCardPlay, playCardButton, holdButton, revealButton, turnSkipButton, roundSkipbutton, isDebug, enabled, }: {
    socket: Socket;
    roomId: RoomId;
    players: Player[];
    currentPlayerId?: PlayerId | null;
    myPlayerId: PlayerId | null;
    playCardLimit?: number;
    autoNextTurnOnCardPlay?: boolean;
    playCardButton?: boolean;
    holdButton?: boolean;
    revealButton?: boolean;
    turnSkipButton?: boolean;
    roundSkipbutton?: boolean;
    isDebug?: boolean;
    enabled?: boolean;
}): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=ScoreBoard.d.ts.map