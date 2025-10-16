import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Deck from "../../src/components/Deck";
import PlayField from "../../src/components/PlayField";
import ScoreBoard from "../../src/components/ScoreBoard";
import TokenStore from "../../src/components/TokenStore";
import { useSocket } from "../../src/hooks/useSocket";
import type { ResourceId } from "../../src/types/definition";
import type { Player } from "../../src/types/player";
import type { PlayerWithResources } from "../../src/types/playerWithResources";
import DebugControlPanel from "../components/DebugControlPanel";
import MyBoard from "../components/MyBoard";

// 仮のサーバーURL
const SERVER_URL = "http://127.0.0.1:4000"; 

// デバッグ/テスト用リソースID
const RESOURCE_IDS = {
    OXYGEN: 'OXYGEN',
    BATTERY: 'BATTERY',
    HULL: 'hull' // 船体耐久度
};

// 既存のApp.tsxのロジックをGameRoomに移植
export default function GameRoom() {
  // 1. URLからroomIdを取得
  const { roomId } = useParams<{ roomId: string }>(); 
  
  // 2. Socket接続を確立
  // useSocketはio(SERVER_URL)をラップしていると仮定
  const socket = useSocket(SERVER_URL); 
  
  const [myPlayerId, setMyPlayerId] = useState<string | null>(null);
  const [players, setPlayers] = useState<PlayerWithResources[]>([]); 
  const [currentPlayerId, setCurrentPlayerId] = useState<string | null>(null);

  // --- デバッグ用状態 ---
  const [debugTargetId, setDebugTargetId] = useState<string | null>(null);
  const [debugScoreAmount, setDebugScoreAmount] = useState<number>(10);
  const [debugResourceAmount, setDebugResourceAmount] = useState<number>(1);
  // ----------------------

  useEffect(() => {
    if (!socket || !roomId) return;
    
    // 💡 ルーム参加処理
    socket.emit("room:join", roomId); 
    console.log(`Socket joining room: ${roomId}`);

    // --- ゲームロジックのイベントリスナー ---
    
    socket.on("player:assign-id", (id: Player["id"]) => {
        setMyPlayerId(id);
        setDebugTargetId(id); 
    });
    
    socket.on("players:update", (updatedPlayers: PlayerWithResources[]) => {
      setPlayers(updatedPlayers);
    });
    
    socket.on("game:turn", setCurrentPlayerId);

    // --- クリーンアップ ---
    return () => {
        // コンポーネントがアンマウントされたら、ルームを離脱するイベントを送信しても良い
        socket.emit("room:leave", roomId);
        socket.off("player:assign-id");
        socket.off("players:update");
        socket.off("game:turn");
    };
  }, [socket, roomId]); // 依存配列にsocketとroomIdを含める
  
  // ----------------------------------------------------
  // デバッグ/テスト用ロジック (App.tsxから移動)
  // ----------------------------------------------------
  const handleDebugScore = (amount: number) => {
    if (!socket || !debugTargetId || !roomId) return;
    // 💡 ルームIDをペイロードに追加
    socket.emit('room:player:add-score', { 
        roomId, // ルームIDを追加
        targetPlayerId: debugTargetId, 
        points: amount 
    });
  };

  const handleDebugResource = (resourceId: ResourceId, amount: number) => {
    if (!socket || !debugTargetId || !roomId) return;
    // 💡 ルームIDをペイロードに追加
    socket.emit('room:player:update-resource', { 
        roomId, // ルームIDを追加
        targetPlayerId: debugTargetId, 
        resourceId: resourceId, 
        amount: amount 
    });
  };
  
  // ----------------------------------------------------

  if (!roomId) return <p>ルームIDの取得を待っています...</p>;
  if (!socket) return <p>サーバーに接続中...</p>;
  
  // App.tsxから移動したスタイルとレンダリング部分
  // ... (スタイルは省略し、JSX部分のみを抽出)
  
  // 1. 🌊 ブラウザ全体に適用する背景スタイル (深海グラデーション + グリッド模様)
  const fullScreenBackgroundStyle: React.CSSProperties = {
    minHeight: '100vh', 
    backgroundColor: '#0a192f', 
    backgroundImage: `
      linear-gradient(135deg, #0a192f 0%, #1e3a5f 70%, #0a192f 100%),
      linear-gradient(to right, rgba(139, 233, 253, 0.05) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(139, 233, 253, 0.05) 1px, transparent 1px)
    `,
    backgroundSize: `
      auto,
      30px 30px, 
      30px 30px  
    `,
    backgroundPosition: `
      center,
      center,
      center
    `,
    position: 'relative', 
    overflow: 'hidden', 
    padding: '20px', 
    boxSizing: 'border-box',
    fontFamily: 'Roboto, sans-serif', 
  };
  
  // 3. ✨ タイトル装飾スタイル
  const titleStyle: React.CSSProperties = {
    textAlign: 'center', 
    color: '#ffffff', 
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
    <div style={fullScreenBackgroundStyle}>
      <div>
        <h1 style={titleStyle}>
          ディープ・アビス (Deep Abyss) - Room ID: {roomId}
        </h1>
        <p style={subtitleStyle}>
          深海を調査して眠れる資源を見つけ出せ！
        </p>
        
        <div style={boardWrapperStyle}>
            <MyBoard 
              socket={socket}
              myPlayerId={myPlayerId}
              />
        </div>

        <TokenStore socket={socket} tokenStoreId="ARTIFACT" name="遺物"></TokenStore>

        <DebugControlPanel
                players={players}
                myPlayerId={myPlayerId}
                debugTargetId={debugTargetId}
                setDebugTargetId={setDebugTargetId}
                debugScoreAmount={debugScoreAmount}
                setDebugScoreAmount={setDebugScoreAmount}
                handleDebugScore={handleDebugScore}
                debugResourceAmount={debugResourceAmount}
                setDebugResourceAmount={setDebugResourceAmount}
                handleDebugResource={handleDebugResource}
                RESOURCE_IDS={RESOURCE_IDS}
                debugPanelStyle={debugPanelStyle}
                inputStyle={inputStyle}
            /> 

        <div style={{ 
          display: 'flex', 
          gap: '20px', 
          marginTop: '20px', 
          alignItems: 'flex-start' 
        }}>
          
          <div style={{ display: 'flex', gap: '20px' }}>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', flex: '0 0 220px' }}>
              <Deck 
                socket={socket} 
                deckId="deepSeaAction" 
                name="アクションカード" 
                playerId={currentPlayerId} 
              />
              <Deck 
                socket={socket} 
                deckId="deepSeaSpecies" 
                name="深海生物カード" 
                playerId={currentPlayerId} 
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', flex: '0 0 320px' }}>
              <PlayField 
                socket={socket} 
                deckId="deepSeaAction" 
                name="アクションカード" 
              />
              <PlayField 
                socket={socket} 
                deckId="deepSeaSpecies" 
                name="深海生物カード" 
              />
            </div>
            
          </div>

          <div style={{ flex: '1 1 auto', minWidth: '250px', backgroundColor: 'transparent' }}> 
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
