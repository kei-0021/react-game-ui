import { Socket } from 'socket.io-client';
import { RoomId, TokenStoreId } from '../types/definition.js';
import { Token } from '../types/token.js';
type TokenStoreProps = {
    socket: Socket;
    roomId: RoomId;
    tokenStoreId: TokenStoreId;
    title: string;
    onSelect?: (token: Token) => void;
};
/**
 * トークンストアを表示および管理するコンポーネント。
 * ソケット通信を介してトークンの状態を同期し、UI上で選択および取得の操作を提供します。
 *
 * @param {Socket} socket - 通信に使用するSocket.ioインスタンス
 * @param {RoomId} roomId - 現在参加しているルームの識別子
 * @param {TokenStoreId} tokenStoreId - このトークンストア固有の識別子
 * @param {string} title - UIに表示するストアのタイトル
 * @param {(token: Token) => void} [onSelect] - トークンが選択された際に呼び出されるオプションのコールバック関数
 */
export declare function TokenStore({ socket, roomId, tokenStoreId, title: name, onSelect }: TokenStoreProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=TokenStore.d.ts.map