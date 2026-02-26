import { Socket } from 'socket.io-client';
import type { DeckId, PlayerId, RoomId } from '../types/definition.js';
import type { PlayerWithResources } from '../types/playerWithResources.js';
import './PlayField.css';
type PlayFieldProps = {
    socket: Socket;
    roomId: RoomId;
    deckId: DeckId;
    title?: string;
    players: PlayerWithResources[];
    myPlayerId: PlayerId | null;
    layoutMode?: 'grid' | 'free';
    backgroundImage?: string;
    is_logging?: boolean;
};
/**
 * カードを自由配置（Free Mode）またはグリッド配置し、移動やドロップ操作を管理する
 * @param {Socket} socket - Socket.ioのインスタンス
 * @param {RoomId} roomId - 現在のルームID
 * @param {DeckId} deckId - このフィールドが紐付いているデッキのID
 * @param {string} [title] - フィールドの表示タイトル
 * @param {PlayerWithResources[]} players - ルームに参加しているプレイヤー情報（オーナー表示用）
 * @param {PlayerId | null} myPlayerId - ローカルプレイヤーのID
 * @param {'grid' | 'free'} [layoutMode='free'] - カードの配置モード（自由配置またはグリッド）
 * @param {string} [backgroundImage] - フィールドの背景画像URL
 * @param {boolean} [is_logging=false] - デバッグログを出力するかどうか
 */
export declare function PlayField({ socket, roomId, deckId, title, players, myPlayerId, layoutMode, is_logging, backgroundImage, }: PlayFieldProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=PlayField.d.ts.map