import React from "react";
import Deck from "../src/components/Deck";
import PlayField from "../src/components/PlayField";
import ScoreBoard from "../src/components/ScoreBoard";
import { useSocket } from "../src/hooks/useSocket";
import type { Player } from "../src/types/player";
import type { Resource } from "../src/types/resource";
import MyBoard from "./MyBoard"; // .js拡張子を削除

// 抽象的な Player 型にリソース情報が付加されていることを示す型を定義
type PlayerWithResources = Player & { resources: Resource[] };

// デバッグ/テスト用リソースID
const RESOURCE_IDS = {
    OXYGEN: 'OXYGEN',
    BATTERY: 'BATTERY',
    HULL: 'hull' // 船体耐久度
};


export default function App() {
  const socket = useSocket("http://127.0.0.1:4000");
  const [myPlayerId, setMyPlayerId] = React.useState<string | null>(null);
  
  // 状態管理の型を PlayerWithResources[] に変更
  const [players, setPlayers] = React.useState<PlayerWithResources[]>([]); 
  
  const [currentPlayerId, setCurrentPlayerId] = React.useState<string | null>(null);

  // --- デバッグ用状態 ---
  const [debugTargetId, setDebugTargetId] = React.useState<string | null>(null);
  const [debugScoreAmount, setDebugScoreAmount] = React.useState<number>(10);
  const [debugResourceAmount, setDebugResourceAmount] = React.useState<number>(10);
  // ----------------------

  React.useEffect(() => {
    if (!socket) return;

    socket.on("player:assign-id", (id) => {
        setMyPlayerId(id);
        setDebugTargetId(id); // 初期ターゲットを自分自身に設定
    });
    
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
  
  // ----------------------------------------------------
  // デバッグ/テスト用ロジック
  // ----------------------------------------------------

  const handleDebugScore = (amount: number) => {
    if (!socket || !debugTargetId) return;
    socket.emit('player:add-score', { 
        targetPlayerId: debugTargetId, 
        points: amount 
    });
  };

  const handleDebugResource = (resourceId: string, amount: number) => {
    if (!socket || !debugTargetId) return;
    socket.emit('player:update-resource', { 
        targetPlayerId: debugTargetId, 
        resourceId: resourceId, 
        amount: amount 
    });
  };
  
  // ----------------------------------------------------

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

  // 5. 🛠️ デバッグコントロールパネルのスタイル
  const debugPanelStyle: React.CSSProperties = {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    padding: '15px',
    borderRadius: '8px',
    marginBottom: '20px',
    border: '1px dashed rgba(139, 233, 253, 0.3)',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  };
  
  const inputStyle: React.CSSProperties = {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    color: 'white',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    borderRadius: '4px',
    padding: '4px',
    width: '50px',
    textAlign: 'center',
    marginRight: '10px',
  };

  return (
    // 1. ブラウザ全体に背景スタイルを適用 (親要素)
    <div style={fullScreenBackgroundStyle}>
      
      {/* 2. コンテンツエリアにグラスモーフィズムスタイルを適用 */}
      <div>
        
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
        
        {/* 5. 🛠️ デバッグコントロールパネル */}
        <div style={debugPanelStyle}>
            <p style={{ color: '#FFEB3B', fontSize: '1.1em', marginBottom: '8px' }}>🛠️ デバッグ/テストコントロール</p>
            
            {/* ターゲットプレイヤー選択 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <select 
                    value={debugTargetId || ''} 
                    onChange={(e) => setDebugTargetId(e.target.value)}
                    style={{ 
                        ...inputStyle, 
                        width: '180px', 
                        cursor: 'pointer',
                        backgroundColor: 'rgba(0, 188, 212, 0.2)',
                    }}
                >
                    <option value="" disabled>プレイヤーを選択</option>
                    {players.map(p => (
                        <option key={p.id} value={p.id}>
                            {p.name} ({p.id === myPlayerId ? '自分' : p.id.substring(0, 4)})
                        </option>
                    ))}
                </select>
            </div>
            
            {/* スコア更新 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input 
                    type="number" 
                    value={debugScoreAmount} 
                    onChange={(e) => setDebugScoreAmount(parseInt(e.target.value) || 0)}
                    style={inputStyle}
                />
                <button 
                    onClick={() => handleDebugScore(debugScoreAmount)}>
                    + スコア加算
                </button>
                <button 
                    onClick={() => handleDebugScore(-debugScoreAmount)}>
                    - スコア減算
                </button>
            </div>

            {/* リソース更新 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input 
                    type="number" 
                    value={debugResourceAmount} 
                    onChange={(e) => setDebugResourceAmount(parseInt(e.target.value) || 0)}
                    style={inputStyle}
                />
                
                {/* 酸素 (Oxygen) */}
                <button 
                    onClick={() => handleDebugResource(RESOURCE_IDS.OXYGEN, debugResourceAmount)}>
                    酸素 +
                </button>
                <button 
                    onClick={() => handleDebugResource(RESOURCE_IDS.OXYGEN, -debugResourceAmount)}>
                    酸素 -
                </button>

                {/* バッテリー (Battery) */}
                <button 
                    onClick={() => handleDebugResource(RESOURCE_IDS.BATTERY, debugResourceAmount)}>
                    バッテリー +
                </button>
                <button 
                    onClick={() => handleDebugResource(RESOURCE_IDS.BATTERY, -debugResourceAmount)}>
                    バッテリー -
                </button>
            </div>
        </div>


        {/* Flexbox レイアウト (Deck/PlayAreaコンテナとScoreBoard) */}
        <div style={{ 
          display: 'flex', 
          gap: '20px', 
          marginTop: '20px', 
          alignItems: 'stretch' 
        }}>
          
          {/* 左側: DeckとPlayFieldを縦に並べるコンテナ (幅を400pxに調整) */}
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '20px', 
            flex: '0 0 400px' 
          }}> 
            
            {/* 1. Deckコンポーネント (上部) */}
            <div style={{ flex: '0 0 auto' }}>
              <Deck 
                socket={socket} 
                deckId="deepSea" 
                name="深海生物カード" 
                playerId={currentPlayerId} 
              />
            </div>

            {/* 2. PlayFieldコンポーネント (下部) */}
            <div style={{ flex: '0 0 auto' }}> 
              <PlayField 
                socket={socket} 
                deckId="deepSea" 
                name="深海生物カード" 
              />
            </div>
          </div>

          {/* 右側: スコアボード (最小幅を250pxに調整) */}
          <div style={{ 
            flex: '1 1 auto', 
            minWidth: '250px', // 最小幅を250pxに縮小
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
