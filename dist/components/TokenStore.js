import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// src/components/TokenStore.tsx
import React, { useCallback, useEffect, useMemo, useState } from "react";
// =========================================================================
// ヘルパーコンポーネント: トークン表面の内容をレンダリング (React.memoでラップ)
// =========================================================================
const TokenContent = React.memo(({ token }) => {
    if (token.imageSrc) {
        return (_jsx("img", { src: token.imageSrc, alt: token.name, style: {
                width: '100%',
                height: '100%',
                objectFit: 'contain'
            } }));
    }
    return (_jsx("div", { style: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            width: '100%',
            padding: '5px',
        }, children: _jsx("strong", { style: { fontSize: '1em', wordBreak: 'break-all', textAlign: 'center' }, children: token.name }) }));
});
export default function TokenStore({ socket, roomId, tokenStoreId, name, onSelect }) {
    const [tokens, setTokens] = useState([]);
    const [selectedId, setSelectedId] = useState(null);
    // --- イベントハンドラ ---
    const handleInitTokens = useCallback((initialTokens) => {
        console.log(`TokenStore (${tokenStoreId}): 初期情報を受信しました。`, initialTokens);
        setTokens(initialTokens && initialTokens.length > 0 ? initialTokens : []);
    }, [tokenStoreId]);
    const handleUpdateTokens = useCallback((updatedTokens) => {
        console.log(`TokenStore (${tokenStoreId}): 更新情報を受信しました。`, updatedTokens);
        setTokens(updatedTokens || []);
    }, [tokenStoreId]);
    // --- useEffect: イベントリスナーの登録と解除 ---
    useEffect(() => {
        if (!socket) {
            console.warn("TokenStore: Socket connection is not available. UI remains empty.");
            return;
        }
        const INIT_EVENT = `token-store:init:${roomId}:${tokenStoreId}`;
        const UPDATE_EVENT = `token-store:update:${roomId}:${tokenStoreId}`;
        socket.on(INIT_EVENT, handleInitTokens);
        socket.on(UPDATE_EVENT, handleUpdateTokens);
        console.log(`TokenStore (${tokenStoreId}): リスナーを登録しました。`);
        return () => {
            socket.off(INIT_EVENT, handleInitTokens);
            socket.off(UPDATE_EVENT, handleUpdateTokens);
            console.log(`TokenStore (${tokenStoreId}): リスナーを解除しました。`);
        };
    }, [socket, roomId, tokenStoreId, handleInitTokens, handleUpdateTokens]);
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
        const payload = {
            roomId, // ⭐ 追加
            tokenStoreId,
            tokenId: id,
            tokenName: token.name,
        };
        console.log(`[TokenStore] ダブルクリック: トークン獲得イベント 'game:acquire-token' を送信`, payload);
        socket.emit('game:acquire-token', payload);
        setSelectedId(null);
    };
    const TOKEN_SIZE = "40px";
    return (_jsxs("section", { style: {
            backgroundColor: '#dededeff',
            padding: '10px',
            margin: '15px',
            borderRadius: '10px',
            boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
        }, children: [_jsx("h3", { style: { marginBottom: "10px", color: '#333' }, children: name }), _jsx("div", { style: { display: "flex", gap: "12px", flexWrap: 'wrap' }, children: tokens.map((t) => (_jsx("div", { onClick: () => handleClick(t.id), onDoubleClick: () => handleDoubleClick(t.id), style: {
                        padding: "8px",
                        width: TOKEN_SIZE,
                        height: TOKEN_SIZE,
                        borderRadius: "50%",
                        border: selectedId === t.id
                            ? "2px solid #f6fbd1ff"
                            : "2px solid #ccc",
                        backgroundColor: "#4f4848ff",
                        cursor: "pointer",
                        textAlign: "center",
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-around',
                        alignItems: 'center',
                        boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                    }, children: _jsx("div", { style: {
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }, children: _jsx(TokenContent, { token: t }) }) }, t.id))) })] }));
}
