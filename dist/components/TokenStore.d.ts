import { Socket } from 'socket.io-client';
import { RoomId, TokenStoreId } from '../types/definition.js';
import { Token } from '../types/token.js';
type TokenStoreProps = {
    socket: Socket;
    roomId: RoomId;
    tokenStoreId: TokenStoreId;
    name: string;
    onSelect?: (token: Token) => void;
};
export declare function TokenStore({ socket, roomId, tokenStoreId, name, onSelect }: TokenStoreProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=TokenStore.d.ts.map