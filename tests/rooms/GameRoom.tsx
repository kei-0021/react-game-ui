import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import Deck from "../../src/components/Deck";
import PlayField from "../../src/components/PlayField";
import ScoreBoard from "../../src/components/ScoreBoard";
import TokenStore from "../../src/components/TokenStore";
import { useSocket } from "../../src/hooks/useSocket";
import type { Player } from "../../src/types/player";
import type { PlayerWithResources } from "../../src/types/playerWithResources";
import DebugControlPanel from "../components/DebugControlPanel";
import MyBoard from "../components/MyBoard";
import Popup from '../components/PopUp';

const SERVER_URL = "http://127.0.0.1:4000";

const RESOURCE_IDS = {
  OXYGEN: "OXYGEN",
  BATTERY: "BATTERY",
  HULL: "HULL", // 船体耐久度
};

// ★ ポップアップの状態の型定義
interface PopupState {
    message: string;
    color: string;
    visible: boolean;
}

export default function GameRoom() {
  const { roomId } = useParams<{ roomId: string }>();
  const socket = useSocket(SERVER_URL);

  // ★ 1. ポップアップの状態を追加
  const [popup, setPopup] = useState<PopupState>({ message: '', color: 'blue', visible: false });

  // ★ プレイヤー名入力と参加状態
  const [userName, setUserName] = useState<string>('');
  const [isJoining, setIsJoining] = useState<boolean>(false);
  const [hasJoined, setHasJoined] = useState<boolean>(false);

  const [myPlayerId, setMyPlayerId] = useState<string | null>(null);
  const [players, setPlayers] = useState<PlayerWithResources[]>([]);
  const [currentPlayerId, setCurrentPlayerId] = useState<string | null>(null);

  // --- デバッグ用 ---
  const [debugTargetId, setDebugTargetId] = useState<string | null>(null);
  const [debugScoreAmount, setDebugScoreAmount] = useState<number>(10);
  const [debugResourceAmount, setDebugResourceAmount] = useState<number>(1);
  // ------------------

  // ★ 汎用ポップアップ表示ロジック
  const showPopup = useCallback((message: string, color: string) => {
    // 既存のポップアップがあれば非表示にする
    setPopup({ message, color, visible: true });
    
    // 8秒後に自動的に非表示にする
    setTimeout(() => {
        // メッセージと色はそのままで、可視性のみ変更
        setPopup(prev => ({ ...prev, visible: false }));
    }, 8000);
  }, []);

  // ★ 新しい参加ハンドラ
  const handleJoinRoom = useCallback(() => {
    if (!socket || !roomId || userName.trim() === '' || isJoining) return;

    setIsJoining(true);

    // サーバーの `room:join` イベントのペイロードをオブジェクトに変更
    socket.emit("room:join", { roomId, playerName: userName.trim() });
    console.log(`[CLIENT] Attempting to join room: ${roomId} as ${userName.trim()}`);
  }, [socket, roomId, userName, isJoining]);

  // ★ useEffectのロジック
  useEffect(() => {
    if (!socket || !roomId) return; // hasJoinedがtrueになってからリスナーを設定

    const handleAssignId = (id: Player["id"]) => {
      console.log("[CLIENT] Assigned player ID:", id);
      setMyPlayerId(id);
      setDebugTargetId(id);
      setHasJoined(true); // サーバーからIDを受け取った時点で「参加完了」とする
      setIsJoining(false); // 参加処理完了
    };

    const handlePlayersUpdate = (updatedPlayers: PlayerWithResources[]) => {
      console.log("[CLIENT] players:update", updatedPlayers);
      setPlayers(updatedPlayers);
    };

    const handleGameTurn = (id: string) => {
      console.log("[CLIENT] game:turn:", id);
      setCurrentPlayerId(id);
    };

    // ★ 2. ポップアップ受信リスナーの追加
    const handleShowPopup = (data: { message: string; color: string }) => {
        console.log("[CLIENT] client:show-popup received:", data);
        showPopup(data.message, data.color);
    };
    
    // イベントリスナーの設定
    socket.on("player:assign-id", handleAssignId);
    socket.on("players:update", handlePlayersUpdate);
    socket.on("game:turn", handleGameTurn);
    socket.on("client:show-popup", handleShowPopup); // ★ 追加

    return () => {
      // 離脱処理（ここはユーザーが手動でページ遷移した場合に実行される）
      socket.off("player:assign-id", handleAssignId);
      socket.off("players:update", handlePlayersUpdate);
      socket.off("game:turn", handleGameTurn);
      socket.off("client:show-popup", handleShowPopup); // ★ 追加
    };
  }, [socket, roomId, showPopup]);


  // --- デバッグ用操作 (変更なし) ---
  const handleDebugScore = (amount: number) => {
    if (!socket || !debugTargetId || !roomId) return;
    socket.emit("room:player:add-score", {
      roomId,
      targetPlayerId: debugTargetId,
      points: amount,
    });
  };

  const handleDebugResource = (resourceId: string, amount: number) => {
      if (!socket || !debugTargetId || !roomId) return;
      console.log("ここを通った")
      socket.emit("room:player:update-resource", {
          roomId,
          playerId: debugTargetId,
          resourceId,
          amount,
      });
  };
  
  // ★ 3. require-popup イベント発火ハンドラ
  const handleTestPopup = useCallback((message: string, color: string) => {
    if (!socket || !roomId || !hasJoined) return;
    
    // サーバーの `require-popup` イベントを発火させる
    // NOTE: サーバー側でこのイベントを受けて、client:show-popupをルーム全員にemitする必要があります。
    socket.emit("require-popup", {
        roomId,
        message,
        color
    });
    console.log(`[CLIENT] Sent require-popup to server for room: ${roomId}`);
  }, [socket, roomId, hasJoined]);


  // --- UIスタイル (変更なし) ---
  const fullScreenBackgroundStyle: React.CSSProperties = useMemo(() => ({
    minHeight: "100vh",
    backgroundColor: "#0a192f",
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
    backgroundPosition: "center",
    padding: "20px",
    fontFamily: "Roboto, sans-serif",
    color: "black"
  }), []);


  const titleStyle: React.CSSProperties = {
    textAlign: "center",
    color: "#8be9fd",
    textShadow: "0 0 10px rgba(139, 233, 253, 0.5)",
    marginBottom: "10px",
  };

  const subtitleStyle: React.CSSProperties = {
    textAlign: "center",
    color: "#ffffffff",
    fontSize: "1em",
    marginBottom: "20px",
  };

  const boardWrapperStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "center",
    marginBottom: "20px",
  };

  const debugPanelStyle: React.CSSProperties = {
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    padding: "15px",
    borderRadius: "8px",
    marginBottom: "20px",
    border: "1px dashed rgba(139, 233, 253, 0.3)",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  };

  const inputStyle: React.CSSProperties = {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    color: "white",
    border: "1px solid rgba(255, 255, 255, 0.3)",
    borderRadius: "4px",
    padding: "4px",
    width: "50px",
    textAlign: "center",
    marginRight: "10px",
  };
  
  // ★ ルーム参加フォームのスタイル
  const joinFormStyle: React.CSSProperties = {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: '#1e3a5f',
    padding: '30px',
    borderRadius: '10px',
    boxShadow: '0 0 20px rgba(139, 233, 253, 0.5)',
    zIndex: 1000,
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
    textAlign: 'center',
  };

  const joinInputStyle: React.CSSProperties = {
    padding: '10px',
    borderRadius: '5px',
    border: '1px solid #8be9fd',
    backgroundColor: '#0a192f',
    color: 'white',
    fontSize: '1em',
  };

  const joinButtonStyle: React.CSSProperties = {
    padding: '10px 20px',
    borderRadius: '5px',
    border: 'none',
    backgroundColor: '#8be9fd',
    color: '#0a192f',
    fontWeight: 'bold',
    cursor: 'pointer',
    fontSize: '1em',
    transition: 'background-color 0.3s',
  };

  // --- 接続前の状態 ---
  if (!roomId)
    return (
      <div style={fullScreenBackgroundStyle}>
        <h1 style={titleStyle}>Game Room Status</h1>
        <p>⚠️ ルームIDがURLから取得できませんでした。</p>
      </div>
    );

  if (!socket)
    return (
      <div style={fullScreenBackgroundStyle}>
        <h1 style={titleStyle}>Game Room Status: {roomId}</h1>
        <p>サーバーに接続中... (URL: {SERVER_URL})</p>
      </div>
    );

  // --- ルーム参加フォームの表示 ---
  if (!hasJoined) {
    return (
      <div style={fullScreenBackgroundStyle}>
        <div style={joinFormStyle}>
          <h2 style={{ color: '#8be9fd', marginBottom: '5px' }}>ルーム参加</h2>
          <p style={{ margin: '0 0 10px 0', color: 'white' }}>Room ID: {roomId}</p>
          
          <input
            style={joinInputStyle}
            type="text"
            placeholder="あなたの名前を入力してください"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            disabled={isJoining}
            maxLength={12}
            onKeyDown={(e) => e.key === 'Enter' && handleJoinRoom()}
          />

          <button
            style={joinButtonStyle}
            onClick={handleJoinRoom}
            disabled={userName.trim() === '' || isJoining}
          >
            {isJoining ? '参加中...' : 'ルームに参加'}
          </button>
          {isJoining && <p style={{ margin: '5px 0 0 0', color: '#ffeb3b' }}>サーバーからの応答を待っています...</p>}
        </div>
      </div>
    );
  }


  // --- ゲームUI本体 ---
  return (
    <div style={fullScreenBackgroundStyle}>
      {/* ✅ ポップアップUIのレンダリングを修正
        popup stateの visible, color, message をそれぞれPropsとして渡す
      */}
      <Popup visible={popup.visible} color={popup.color}>
        {popup.message}
      </Popup>

      <h1 style={titleStyle}>ディープ・アビス (Deep Abyss) - Room ID: {roomId}</h1>
      <p style={subtitleStyle}>深海を調査して眠れる資源を見つけ出せ！</p>

      {/* ★ ポップアップテストボタンの配置 */}
      <div style={{ textAlign: 'center', marginBottom: '20px', display: 'flex', justifyContent: 'center', gap: '10px' }}>
          <button 
            style={{ ...joinButtonStyle, backgroundColor: '#3b82f6', color: 'white' }}
            onClick={() => handleTestPopup("ソナーがフルチャージされました！", "blue")}
          >
            Blue Pop
          </button>
          <button 
            style={{ ...joinButtonStyle, backgroundColor: '#10b981', color: 'white' }}
            onClick={() => handleTestPopup("希少な遺物を発見！", "green")}
          >
            Green Pop
          </button>
          <button 
            style={{ ...joinButtonStyle, backgroundColor: '#f59e0b', color: 'white' }}
            onClick={() => handleTestPopup("酸素残量が危険域です。", "yellow")}
          >
            Yellow Pop
          </button>
          <button 
            style={{ ...joinButtonStyle, backgroundColor: '#dc2626', color: 'white' }}
            onClick={() => handleTestPopup("巨大深海生物に遭遇！", "red")}
          >
            Red Pop
          </button>
      </div>
      {/* ----------------------------- */}


      <div style={boardWrapperStyle}>
        <MyBoard socket={socket} roomId={roomId} myPlayerId={myPlayerId} />
      </div>

      <TokenStore socket={socket} roomId={roomId} tokenStoreId="ARTIFACT" name="遺物" />

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

      <div
        style={{
          display: "flex",
          gap: "20px",
          marginTop: "20px",
          alignItems: "flex-start",
        }}
      >
        {/* デッキ + フィールド */}
        <div style={{ display: "flex", gap: "20px" }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "20px",
              flex: "0 0 220px",
            }}
          >
            <Deck
              socket={socket}
              roomId={roomId}
              deckId="deepSeaAction"
              name="アクションカード"
              playerId={currentPlayerId}
            />
            <Deck
              socket={socket}
              roomId={roomId}
              deckId="deepSeaSpecies"
              name="深海生物カード"
              playerId={currentPlayerId}
            />
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "20px",
              flex: "0 0 320px",
            }}
          >
            <PlayField
              socket={socket}
              roomId={roomId}
              deckId="deepSeaAction"
              name="アクションカード"
            />
            <PlayField
              socket={socket}
              roomId={roomId}
              deckId="deepSeaSpecies"
              name="深海生物カード"
            />
          </div>
        </div>

        {/* スコアボード */}
        <div
          style={{
            flex: "1 1 auto",
            minWidth: "250px",
            backgroundColor: "transparent",
          }}
        >
          <ScoreBoard
            socket={socket}
            roomId={roomId}
            players={players}
            currentPlayerId={currentPlayerId}
            myPlayerId={myPlayerId}
          />
        </div>
      </div>
    </div>
  );
}