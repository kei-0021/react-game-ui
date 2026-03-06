import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback, useEffect, useMemo, useState } from 'react';
import { TokenDisplayContent } from './Token.js';
import styles from './TokenStore.module.css';
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
export function TokenStore({ socket, roomId, tokenStoreId, title: name, onSelect }) {
    const [tokens, setTokens] = useState([]);
    const handleUpdateTokens = useCallback((data) => {
        setTokens(data.tokenStore || []);
    }, []);
    useEffect(() => {
        if (!socket)
            return;
        socket.on(`token-store:update`, handleUpdateTokens);
        return () => {
            socket.off(`token-store:update`, handleUpdateTokens);
        };
    }, [socket, handleUpdateTokens]);
    const getTokenById = useMemo(() => (id) => tokens.find((t) => t.id === id), [tokens]);
    const handleClick = (id) => {
        const token = getTokenById(id);
        if (!token)
            return;
        onSelect?.(token);
    };
    const handleDoubleClick = (id) => {
        const token = getTokenById(id);
        if (!token)
            return;
        const data = { roomId, tokenStoreId, tokenId: id };
        socket.emit('token:aquire', data);
    };
    return (_jsxs("section", { className: styles.section, children: [_jsx("h3", { className: styles.title, children: name }), _jsx("div", { className: styles.list, children: tokens.map((t) => (_jsx("div", { onClick: () => handleClick(t.id), onDoubleClick: () => handleDoubleClick(t.id), children: _jsx(TokenDisplayContent, { token: t }) }, t.id))) })] }));
}
