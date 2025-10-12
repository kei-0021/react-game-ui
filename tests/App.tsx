import React from "react";
import Deck from "../src/components/Deck.js";
import PlayField from "../src/components/PlayField.js";
import ScoreBoard from "../src/components/ScoreBoard.js";
import { useSocket } from "../src/hooks/useSocket.js";
import type { Player } from "../src/types/player.js";
import type { Resource } from "../src/types/resource.js";
import MyBoard from "./MyBoard.js";

// 抽象的な Player 型にリソース情報が付加されていることを示す型を定義
type PlayerWithResources = Player & { resources: Resource[] };

export default function App() {
  const socket = useSocket("http://127.0.0.1:4000");
  const [myPlayerId, setMyPlayerId] = React.useState<string | null>(null);
  
  // 状態管理の型を PlayerWithResources[] に変更
  const [players, setPlayers] = React.useState<PlayerWithResources[]>([]); 
  
  const [currentPlayerId, setCurrentPlayerId] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!socket) return;

    socket.on("player:assign-id", setMyPlayerId);
    
    // socket.onで受け取るデータも PlayerWithResources[] 型であることを宣言
    // サーバーがこの型でデータを送ることを前提とする
    socket.on("players:update", (updatedPlayers: PlayerWithResources[]) => {
      setPlayers(updatedPlayers);
    });
    
    socket.on("game:turn", setCurrentPlayerId);

    return () => {
      socket.off("player:assign-id");
      socket.off("players:update");
      socket.off("game:turn");
    };
  }, [socket]);

  if (!socket) return <p>接続中…</p>;
  
  
  // 1. 🌊 ブラウザ全体に適用する背景スタイル (深海グラデーション + グリッド模様)
  const fullScreenBackgroundStyle: React.CSSProperties = {
    minHeight: '100vh', 
    backgroundColor: '#0a192f', 
    backgroundImage: `
      // 1. メインの深海グラデーション
      linear-gradient(135deg, #0a192f 0%, #1e3a5f 70%, #0a192f 100%),
      // 2. レーダーのグリッドパターン (薄いシアン)
      linear-gradient(to right, rgba(139, 233, 253, 0.05) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(139, 233, 253, 0.05) 1px, transparent 1px)
    `,
    backgroundSize: `
      auto,
      30px 30px, // グリッドの横サイズ
      30px 30px  // グリッドの縦サイズ
    `,
    backgroundPosition: `
      center,
      center,
      center
    `,
    position: 'relative', // レーダーアニメーションの親要素として設定
    overflow: 'hidden', 
    padding: '20px', 
    boxSizing: 'border-box',
    fontFamily: 'Roboto, sans-serif', 
  };

  // 2. 🧊 コンテンツを包むグラスモーフィズムスタイル
  const contentContainerStyle: React.CSSProperties = {
    padding: '20px',
    backgroundColor: 'rgba(255, 255, 255, 0.05)', 
    borderRadius: '16px', 
    boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.5)', 
    backdropFilter: 'blur(10px) saturate(150%)', 
    WebkitBackdropFilter: 'blur(10px) saturate(150%)', 
    border: '1px solid rgba(255, 255, 255, 0.1)', 
    maxWidth: '1200px', 
    margin: '0 auto', 
    zIndex: 1, // レーダーより前面に配置
    position: 'relative', 
  };
  
  // 3. ✨ タイトル装飾スタイル
  const titleStyle: React.CSSProperties = {
    textAlign: 'center', 
    color: '#ffffff', // 純粋な白
    textShadow: '0 0 10px rgba(139, 233, 253, 0.7)', 
    marginBottom: '5px' 
  };

  // サブタイトルの視認性を向上
  const subtitleStyle: React.CSSProperties = {
    textAlign: 'center', 
    color: '#e0e0e0', 
    fontSize: '1em', 
    marginBottom: '20px' 
  };
  
  // 4. ⭐ MyBoardを中央寄せにするためのラッパー div スタイル
  const boardWrapperStyle: React.CSSProperties = {
      display: 'flex',
      justifyContent: 'center', 
      marginBottom: '20px', 
  };

  return (
    // 1. ブラウザ全体に背景スタイルを適用 (親要素)
    <div style={fullScreenBackgroundStyle}>
      
      {/* 2. コンテンツエリアにグラスモーフィズムスタイルを適用 */}
      <div style={contentContainerStyle}>
        
        {/* 3. タイトルとサブタイトル */}
        <h1 style={titleStyle}>
          ディープ・アビス (Deep Abyss)
        </h1>
        <p style={subtitleStyle}>
          深海を調査して眠れる資源を見つけ出せ！
        </p>
        
        {/* 4. MyBoardを中央寄せするためのラッパーdiv */}
        <div style={boardWrapperStyle}>
            {/* メインのボードコンポーネント */}
            <MyBoard 
              socket={socket}
              myPlayerId={myPlayerId}
            />
        </div>
        
        {/* Flexbox レイアウト (Deck/PlayAreaコンテナとScoreBoard) */}
        <div style={{ 
          display: 'flex', 
          gap: '20px', 
          marginTop: '20px', 
          alignItems: 'stretch' 
        }}>
          
          {/* 左側: DeckとPlayFieldを縦に並べるコンテナ (幅を200pxに調整) */}
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '20px', 
            flex: '0 0 400px' // 横幅を200pxに固定
          }}> 
            
            {/* 1. Deckコンポーネント (上部) */}
            <div style={{ flex: '0 0 auto' }}>
              <Deck 
                socket={socket} 
                deckId="deepSea" 
                name="深海カード" 
                playerId={currentPlayerId} 
              />
            </div>

            {/* 2. PlayFieldコンポーネント (下部) */}
            <div style={{ flex: '0 0 auto' }}> 
              <PlayField 
                socket={socket} 
                deckId="deepSea" 
                name="深海カード" 
              />
            </div>
          </div>

          {/* 右側: スコアボード (最小幅を250pxに調整) */}
          <div style={{ 
            flex: '1 1 auto', 
            minWidth: '250px', // 最小幅を250pxに縮小
            color: '#0a192f', 
            backgroundColor: 'transparent' 
          }}> 
            <ScoreBoard
              socket={socket}
              players={players} 
              currentPlayerId={currentPlayerId}
              myPlayerId={myPlayerId}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
