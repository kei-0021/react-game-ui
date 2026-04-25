import { Player } from '@/types/player.js';
import { Socket } from 'socket.io-client';
import { PlayerId, RoomId } from '../../types/definition.js';
/**
 * スコアボードコンポーネント
 * プレイヤーの一覧、現在のターン、各プレイヤーのスコアやトークン数を表示する
 * 各ボタンのプロパティは [表示/非表示, 有効/無効] のタプル形式で受け取り、
 * 個別の有効フラグが `enabled` (全体設定) よりも優先して適用される。
 * @param {Socket} socket - Socket.ioのインスタンス
 * @param {RoomId} roomId - 現在のルームID
 * @param {PlayerId | null} myPlayerId - ローカルプレイヤーのID
 * @param {PlayerId | null} [currentPlayerId] - 現在の手番のプレイヤーID
 * @param {Player[]} players - ルームに参加しているプレイヤーのリスト
 * @param {number} [playCardLimit] - 1ターンにプレイ可能なカードの上限枚数
 * @param {[boolean, boolean]} [playCardButton=[true, true]] - カードプレイボタンの [表示, 有効]
 * @param {[boolean, boolean]} [holdButton=[false, true]] - カードホールドボタンの [表示, 有効]
 * @param {[boolean, boolean]} [flipButton=[false, true]] - カードをひっくり返すボタンの [表示, 有効]
 * @param {[boolean, boolean]} [turnSkipButton=[false, true]] - ターンスキップボタンの [表示, 有効]
 * @param {[boolean, boolean]} [roundSkipButton=[false, true]] - ラウンドスキップボタンの [表示, 有効]
 * @param {boolean} [isDebug=false] - スコアを手動で増減できるようにするかどうか (デバッグ用)
 * @param {boolean} [enabled=true] - 各種操作が全体的に有効かどうかのフラグ (個別設定がない場合のデフォルト)
 */
export declare function ScoreBoard({ socket, roomId, myPlayerId, currentPlayerId, players, playCardLimit, playCardButton, holdButton, flipButton, turnSkipButton, roundSkipButton, isDebug, enabled, }: {
    socket: Socket;
    roomId: RoomId;
    players: Player[];
    currentPlayerId?: PlayerId | null;
    myPlayerId: PlayerId | null;
    playCardLimit?: number;
    playCardButton?: [boolean, boolean];
    holdButton?: [boolean, boolean];
    flipButton?: [boolean, boolean];
    turnSkipButton?: [boolean, boolean];
    roundSkipButton?: [boolean, boolean];
    isDebug?: boolean;
    enabled?: boolean;
}): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=ScoreBoard.d.ts.map