import { Socket } from 'socket.io-client';
import type { DeckId, PlayerId, RoomId } from '../types/definition.js';
type DeckProps = {
    socket: Socket;
    roomId: RoomId;
    deckId: DeckId;
    title: string;
    currentPlayerId: PlayerId | null;
    myPlayerId: PlayerId | null;
    alwaysDraw?: boolean;
    size?: {
        width: number;
        height: number;
    };
    enabled?: boolean;
};
/**
 * 山札の描画、シャッフル、ドローの制御を行う。
 * @param socket - 通信用のSocket.ioインスタンス
 * @param roomId - 対象のルームID
 * @param deckId - 山札を識別する一意のID
 * @param title - 山札の表示名
 * @param myPlayerId - 操作者自身のプレイヤーID。手札へのドロー先として使用。
 * @param currentPlayerId - 現在のターンプレイヤーID。ターン制の判定に使用。
 * @param alwaysDraw - ターンの制約を無視してドロー可能にするフラグ。
 * @param size={ width: 90, height: 120 } - デッキのサイズ。
 * @param enabled=true - 各種操作が有効かどうかのフラグ。
 */
export declare function Deck({ socket, roomId, deckId, title, myPlayerId, currentPlayerId, alwaysDraw, size, enabled, }: DeckProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=Deck.d.ts.map