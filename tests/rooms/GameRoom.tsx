import { useCallback, useEffect, useRef, useState } from "react";
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
import Popup from "../components/PopUp";
import "./GameRoom.css";

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
  const popupTimerRef = useRef<NodeJS.Timeout | null>(null);

  // ★ 1. ポップアップの状態を追加
  const [popup, setPopup] = useState<PopupState>({
    message: "",
    color: "blue",
    visible: false,
  });

  // ★ プレイヤー名入力と参加状態
  const [userName, setUserName] = useState<string>("");
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
    if (popupTimerRef.current) {
      clearTimeout(popupTimerRef.current);
    }

    // ポップアップを表示
    setPopup({ message, color, visible: true });

    // 2秒後に自動的に非表示にする
    const newTimerId = setTimeout(() => {
      // メッセージと色はそのままで、可視性のみ変更
      setPopup((prev) => ({ ...prev, visible: false }));
      popupTimerRef.current = null; // タイマー完了後、refをクリア
    }, 2000);

    popupTimerRef.current = newTimerId;
  }, []);

  const GAME_PRESET_ID = "deepsea";

  // ★ 新しい参加ハンドラ
  const handleJoinRoom = useCallback(() => {
    if (!socket || !roomId || userName.trim() === "" || isJoining) return;

    setIsJoining(true);

    // サーバーの `room:join` イベントのペイロードをオブジェクトに変更
    socket.emit("room:join", {
      roomId,
      playerName: userName.trim(),
      gamePresetId: GAME_PRESET_ID,
    });

    console.log(
      `[CLIENT] Attempting to join room: ${roomId} as ${userName.trim()}`,
    );
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
    console.log("ここを通った");
    socket.emit("room:player:update-resource", {
      roomId,
      playerId: debugTargetId,
      resourceId,
      amount,
    });
  };

  // ★ 3. require-popup イベント発火ハンドラ
  const handleTestPopup = useCallback(
    (message: string, color: string) => {
      if (!socket || !roomId || !hasJoined) return;

      // サーバーの `require-popup` イベントを発火させる
      // NOTE: サーバー側でこのイベントを受けて、client:show-popupをルーム全員にemitする必要があります。
      socket.emit("require-popup", {
        roomId,
        message,
        color,
      });
      console.log(`[CLIENT] Sent require-popup to server for room: ${roomId}`);
    },
    [socket, roomId, hasJoined],
  );
  // --- 接続前の状態 ---
  if (!roomId)
    return (
      <div className="deepsea-container">
        <h1 className="deepsea-title-center">Game Room Status</h1>
        <div className="status-message">
          <p>⚠️ ルームIDがURLから取得できませんでした。</p>
        </div>
      </div>
    );

  if (!socket)
    return (
      <div className="deepsea-container">
        <h1 className="deepsea-title-center">Game Room Status: {roomId}</h1>
        <div className="status-message">
          <p>サーバーに接続中... (URL: {SERVER_URL})</p>
        </div>
      </div>
    );

  // --- ルーム参加フォームの表示 ---
  if (!hasJoined) {
    return (
      <div className="deepsea-container">
        <div className="join-form-wrapper">
          <h2 className="deepsea-title-center" style={{ marginBottom: "5px" }}>
            ルーム参加
          </h2>
          <p
            className="deepsea-subtitle-center"
            style={{ marginBottom: "10px" }}
          >
            Room ID: {roomId}
          </p>

          <input
            className="join-form-input"
            type="text"
            placeholder="あなたの名前を入力してください"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            disabled={isJoining}
            maxLength={12}
            onKeyDown={(e) => e.key === "Enter" && handleJoinRoom()}
          />

          <button
            className="join-form-button"
            onClick={handleJoinRoom}
            disabled={userName.trim() === "" || isJoining}
          >
            {isJoining ? "参加中..." : "ルームに参加"}
          </button>

          {isJoining && (
            <p className="waiting-text">サーバーからの応答を待っています...</p>
          )}
        </div>
      </div>
    );
  }

  // --- ゲームUI本体 ---
  return (
    <div className="deepsea-container">
      {/* ポップアップUI */}
      <Popup visible={popup.visible} color={popup.color}>
        {popup.message}
      </Popup>
      <h1 className="deepsea-title-center">
        ディープ・アビス (Deep Abyss) - Room ID: {roomId}
      </h1>
      <p className="deepsea-subtitle-center">
        深海を調査して眠れる資源を見つけ出せ！
      </p>
      {/* ボードラッパー */}
      <div className="board-wrapper">
        <MyBoard socket={socket} roomId={roomId} myPlayerId={myPlayerId} />
      </div>
      <TokenStore
        socket={socket}
        roomId={roomId}
        tokenStoreId="ARTIFACT"
        name="遺物"
      />
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
        debugPanelStyle={{}}
        inputStyle={{}}
      />
      <div className="game-main-layout">
        {/* 左側グループ：デッキ列とフィールド列を横に並べる塊 */}
        <div className="game-left-group">
          {/* デッキカラム（縦並び） */}
          <div className="deck-column">
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

          {/* フィールドカラム（縦並び） */}
          <div className="field-column">
            <PlayField
              socket={socket}
              roomId={roomId}
              deckId="deepSeaAction"
              name="アクションカード"
              myPlayerId={myPlayerId}
              players={players}
            />
            <PlayField
              socket={socket}
              roomId={roomId}
              deckId="deepSeaSpecies"
              name="深海生物カード"
              myPlayerId={myPlayerId}
              players={players}
            />
          </div>
        </div>

        {/* スコアボード（一番右に配置） */}
        <div className="scoreboard-column">
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
