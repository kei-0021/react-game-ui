import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from 'react';
import { Token } from './Token.js';
import styles from './TokenStore.module.css';
/**
 * トークンストアを表示および管理するコンポーネント。
 * ソケット通信を介してトークンの状態を同期し、UI上で選択および取得の操作を提供します。
 *
 * @param {Socket} socket - 通信に使用するSocket.ioインスタンス
 * @param {RoomId} roomId - 現在参加しているルームの識別子
 * @param {TokenStoreId} tokenStoreId - このトークンストア固有の識別子
 * @param {string} title - UIに表示するストアのタイトル
 * @param {(token: TokenData) => void} [onSelect] - トークンが選択された際に呼び出されるオプションのコールバック関数
 */
export function TokenStore({ socket, roomId, tokenStoreId, title: name, onSelect }) {
    const [tokenStoreTokens, setTokenStoreTokens] = useState([]);
    useEffect(() => {
        socket.on(`token-store:update:${tokenStoreId}`, (data) => {
            const newTokens = data.tokenStore || [];
            setTokenStoreTokens(newTokens);
        });
        return () => {
            socket.off(`token-store:update:${tokenStoreId}`);
        };
    }, [socket]);
    const getTokenById = useMemo(() => (id) => tokenStoreTokens.find((t) => t.id === id), [tokenStoreTokens]);
    const handleClick = (id) => {
        const token = getTokenById(id);
        if (!token)
            return;
        onSelect?.(token);
    };
    // トークン獲得
    const handleDoubleClick = (tokenId) => {
        const token = getTokenById(tokenId);
        if (!token)
            return;
        const data = { roomId, tokenStoreId, tokenId };
        socket.emit('token:aquire', data);
    };
    // トークン移動
    const handleTokenDragStart = (e, token) => {
        e.dataTransfer.setData('tokenId', token.id);
        e.dataTransfer.setData('source', 'tokenStore');
        e.dataTransfer.effectAllowed = 'move';
    };
    return (_jsxs("section", { className: styles.section, children: [_jsx("h3", { className: styles.title, children: name }), _jsx("div", { className: styles.list, children: tokenStoreTokens.map((t, i) => {
                    // インデックスを利用して擬似的に散らばった位置を計算
                    const offsetX = (i % 5) * 40 - 80;
                    const offsetY = ((i * 3) % 4) * 10 - 20;
                    const rotation = ((i * 13) % 30) - 15;
                    return (_jsx("div", { style: {
                            position: 'absolute',
                            left: `calc(40% + ${offsetX}px)`,
                            top: `calc(50% + ${offsetY}px)`,
                            transform: `rotate(${rotation}deg)`,
                            zIndex: i,
                        }, children: _jsx(Token, { token: t, onClick: () => handleClick(t.id), onDoubleClick: () => handleDoubleClick(t.id), isDraggable: true, onDragStart: handleTokenDragStart }, t.id) }));
                }) })] }));
}
