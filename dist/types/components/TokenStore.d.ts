import { Socket } from "socket.io-client";
import { TokenStoreId } from "../types/definition.js";
import { Token } from "../types/token.js";
type TokenStoreProps = {
    socket: Socket;
    tokenStoreId: TokenStoreId;
    name: string;
    onSelect?: (token: Token) => void;
};
export default function TokenStore({ socket, tokenStoreId, name, onSelect }: TokenStoreProps): import("react/jsx-runtime").JSX.Element;
export {};
