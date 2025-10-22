// src/components/TokenStore.tsx
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Socket } from "socket.io-client";
import { TokenId, TokenStoreId } from "../types/definition.js";
import { Token } from "../types/token.js";

// =========================================================================
// ヘルパーコンポーネント: トークン表面の内容をレンダリング (React.memoでラップ)
// =========================================================================
const TokenContent = React.memo(({ token }: { token: Token }) => {
    if (token.imageSrc) {
      return (
        <img 
          src={token.imageSrc} 
          alt={token.name} 
          style={{ 
            width: '100%', 
            height: '100%', 
            objectFit: 'contain'
          }} 
        />
      );
    }
    return ( 
      <div style={{ 
          display: 'flex', 
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%', 
          width: '100%',
          padding: '5px',
      }}>
          <strong style={{ fontSize: '1em', wordBreak: 'break-all', textAlign: 'center' }}>
              {token.name}
          </strong>
      </div>
    );
});

// =========================================================================
// TokenStore コンポーネント本体
// =========================================================================
type TokenStoreProps = {
  socket: Socket; 
  roomId: string;           // ⭐ 追加
  tokenStoreId: TokenStoreId; 
  name: string; 
  onSelect?: (token: Token) => void;
};

export default function TokenStore({ socket, roomId, tokenStoreId, name, onSelect }: TokenStoreProps) {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [selectedId, setSelectedId] = useState<TokenId | null>(null);

  // --- イベントハンドラ ---
  
  const handleInitTokens = useCallback((initialTokens: Token[]) => {
    console.log(`TokenStore (${tokenStoreId}): 初期情報を受信しました。`, initialTokens);
    setTokens(initialTokens && initialTokens.length > 0 ? initialTokens : []);
  }, [tokenStoreId]); 
  
  const handleUpdateTokens = useCallback((updatedTokens: Token[]) => {
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

  const getTokenById = useMemo(() => 
    (id: TokenId): Token | undefined => tokens.find((t) => t.id === id)
  , [tokens]);

  const handleClick = (id: TokenId) => {
    const token = getTokenById(id);
    if (!token) return;
    setSelectedId(id);
    onSelect?.(token);
  };
  
  const handleDoubleClick = (id: TokenId) => {
    const token = getTokenById(id);
    if (!token) return;
    
    const payload = {
      roomId,           // ⭐ 追加
      tokenStoreId,
      tokenId: id,
      tokenName: token.name,
    };
    
    console.log(`[TokenStore] ダブルクリック: トークン獲得イベント 'game:acquire-token' を送信`, payload);
    socket.emit('game:acquire-token', payload);
    
    setSelectedId(null);
  };

  const TOKEN_SIZE = "40px";

  return (
    <section 
        style={{ 
            backgroundColor: '#dededeff',
            padding: '10px',
            margin: '15px',
            borderRadius: '10px', 
            boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
        }}
    >
        <h3 style={{ marginBottom: "10px", color: '#333' }}>{name}</h3> 
        
        <div style={{ display: "flex", gap: "12px", flexWrap: 'wrap' }}>
            {tokens.map((t) => (
                <div
                key={t.id}
                onClick={() => handleClick(t.id)}
                onDoubleClick={() => handleDoubleClick(t.id)} 
                style={{
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
                }}
                >
                    <div 
                        style={{ 
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <TokenContent token={t} />
                    </div>
                </div>
            ))}
        </div>
    </section>
  );
}
