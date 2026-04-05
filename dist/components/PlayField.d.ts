import { Player } from '@/types/player.js';
import { Socket } from 'socket.io-client';
import type { DeckId, PlayerId, RoomId } from '../types/definition.js';
type PlayFieldProps = {
    socket: Socket;
    roomId: RoomId;
    deckId: DeckId;
    title?: string;
    players: Player[];
    myPlayerId: PlayerId | null;
    layoutMode?: 'grid' | 'free';
    backgroundImage?: string;
    zIndex?: number;
    width?: number;
    height?: number;
    isDebug?: boolean;
};
/**
 * カードを自由配置（Free Mode）またはグリッド配置し、移動やドロップ操作を管理する
 * @param {Socket} socket - Socket.ioのインスタンス
 * @param {RoomId} roomId - 現在のルームID
 * @param {DeckId} deckId - このフィールドが紐付いているデッキのID
 * @param {string} [title] - フィールドの表示タイトル
 * @param {Player[]} players - ルームに参加しているプレイヤー情報（オーナー表示用）
 * @param {PlayerId | null} myPlayerId - ローカルプレイヤーのID
 * @param {'grid' | 'free'} [layoutMode='free'] - カードの配置モード（自由配置またはグリッド）
 * @param {string} [backgroundImage] - フィールドの背景画像URL
 * @param {string} [zIndex] - カードの重ね順
 * @param {number} [width=300] - 横幅
 * @param {number} [height=600] - 縦幅
 * @param {boolean} [isDebug=false] - z-indexをUI表示するフラグ (デバッグ用)
 */
export declare function PlayField({ socket, roomId, deckId, title, players, myPlayerId, layoutMode, backgroundImage, zIndex, width, height, isDebug, }: PlayFieldProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=PlayField.d.ts.map