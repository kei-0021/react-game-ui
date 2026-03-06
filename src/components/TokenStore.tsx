// src/components/TokenStore.tsx
import { TokenAcquireData, TokenStoreUpdateData } from '@/types/socketData.js';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Socket } from 'socket.io-client';
import { RoomId, TokenId, TokenStoreId } from '../types/definition.js';
import { Token } from '../types/token.js';
import { TokenDisplayContent } from './Token.js';
import styles from './TokenStore.module.css';

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
export function TokenStore({ socket, roomId, tokenStoreId, title: name, onSelect }: TokenStoreProps) {
  const [tokens, setTokens] = useState<Token[]>([]);

  const handleUpdateTokens = useCallback((data: TokenStoreUpdateData) => {
    setTokens(data.tokenStore || []);
  }, []);

  useEffect(() => {
    if (!socket) return;
    socket.on(`token-store:update`, handleUpdateTokens);
    return () => {
      socket.off(`token-store:update`, handleUpdateTokens);
    };
  }, [socket, handleUpdateTokens]);

  const getTokenById = useMemo(() => (id: TokenId) => tokens.find((t) => t.id === id), [tokens]);

  const handleClick = (id: TokenId) => {
    const token = getTokenById(id);
    if (!token) return;
    onSelect?.(token);
  };

  const handleDoubleClick = (id: TokenId) => {
    const token = getTokenById(id);
    if (!token) return;
    const data: TokenAcquireData = { roomId, tokenStoreId, tokenId: id };
    socket.emit('token:aquire', data);
  };

  return (
    <section className={styles.section}>
      <h3 className={styles.title}>{name}</h3>
      <div className={styles.list}>
        {tokens.map((t) => (
          <div key={t.id} onClick={() => handleClick(t.id)} onDoubleClick={() => handleDoubleClick(t.id)}>
            <TokenDisplayContent token={t} />
          </div>
        ))}
      </div>
    </section>
  );
}
