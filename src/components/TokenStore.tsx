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
  name: string;
  onSelect?: (token: Token) => void;
};

export function TokenStore({ socket, roomId, tokenStoreId, name, onSelect }: TokenStoreProps) {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [selectedId, setSelectedId] = useState<TokenId | null>(null);

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
    setSelectedId(id);
    onSelect?.(token);
  };

  const handleDoubleClick = (id: TokenId) => {
    const token = getTokenById(id);
    if (!token) return;
    const data: TokenAcquireData = { roomId, tokenStoreId, tokenId: id };
    socket.emit('token:aquire', data);
    setSelectedId(null);
  };

  return (
    <section className={styles.section}>
      <h3 className={styles.title}>{name}</h3>
      <div className={styles.list}>
        {tokens.map((t) => (
          <div
            key={t.id}
            onClick={() => handleClick(t.id)}
            onDoubleClick={() => handleDoubleClick(t.id)}
            className={`${styles.token} ${selectedId === t.id ? styles.selected : ''}`}
          >
            <div className={styles.contentWrapper}>
              <TokenDisplayContent token={t} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
