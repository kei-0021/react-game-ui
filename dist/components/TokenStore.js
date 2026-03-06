import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback, useEffect, useMemo, useState } from 'react';
import { TokenDisplayContent } from './Token.js';
import styles from './TokenStore.module.css';
export function TokenStore({ socket, roomId, tokenStoreId, name, onSelect }) {
    const [tokens, setTokens] = useState([]);
    const [selectedId, setSelectedId] = useState(null);
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
        setSelectedId(id);
        onSelect?.(token);
    };
    const handleDoubleClick = (id) => {
        const token = getTokenById(id);
        if (!token)
            return;
        const data = { roomId, tokenStoreId, tokenId: id };
        socket.emit('token:aquire', data);
        setSelectedId(null);
    };
    return (_jsxs("section", { className: styles.section, children: [_jsx("h3", { className: styles.title, children: name }), _jsx("div", { className: styles.list, children: tokens.map((t) => (_jsx("div", { onClick: () => handleClick(t.id), onDoubleClick: () => handleDoubleClick(t.id), className: `${styles.token} ${selectedId === t.id ? styles.selected : ''}`, children: _jsx("div", { className: styles.contentWrapper, children: _jsx(TokenDisplayContent, { token: t }) }) }, t.id))) })] }));
}
