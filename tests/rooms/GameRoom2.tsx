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

const SERVER_URL = "http://127.0.0.1:4000";

const RESOURCE_IDS = {
  OXYGEN: "OXYGEN",
  BATTERY: "BATTERY",
  HULL: "HULL", // 船体耐久度
};

export default function GameRoom() {
  const { roomId } = useParams<{ roomId: string }>();
  const socket = useSocket(SERVER_URL);

  const [myPlayerId, setMyPlayerId] = useState<string | null>(null);
  const [players, setPlayers] = useState<PlayerWithResources[]>([]);
  const [currentPlayerId, setCurrentPlayerId] = useState<string | null>(null);

  // --- デバッグ用 ---
  const [debugTargetId, setDebugTargetId] = useState<string | null>(null);
  const [debugScoreAmount, setDebugScoreAmount] = useState<number>(10);
  const [debugResourceAmount, setDebugResourceAmount] = useState<number>(1);
  // ------------------

  useEffect(() => {
    if (!socket || !roomId) return;

    socket.emit("room:join", roomId);
    console.log(`[CLIENT] Joined room: ${roomId}`);

    socket.on("player:assign-id", (id: Player["id"]) => {
      console.log("[CLIENT] Assigned player ID:", id);
      setMyPlayerId(id);
      setDebugTargetId(id);
    });

    socket.on("players:update", (updatedPlayers: PlayerWithResources[]) => {
      console.log("[CLIENT] players:update", updatedPlayers);
      setPlayers(updatedPlayers);
    });

    socket.on("game:turn", (id: string) => {
      console.log("[CLIENT] game:turn:", id);
      setCurrentPlayerId(id);
    });

    return () => {
      socket.emit("room:leave", roomId);
      socket.off("player:assign-id");
      socket.off("players:update");
      socket.off("game:turn");
    };
  }, [socket, roomId]);

  // --- デバッグ用操作 ---
  const handleDebugScore = (amount: number) => {
    if (!socket || !debugTargetId || !roomId) return;
    socket.emit("room:player:add-score", {
      roomId,
      targetPlayerId: debugTargetId,
      points: amount,
    });
  };

  const handleDebugResource = (resourceId: ResourceId, amount: number) => {
    if (!socket || !debugTargetId || !roomId) return;
    socket.emit("room:player:update-resource", {
      roomId,
      targetPlayerId: debugTargetId,
      resourceId,
      amount,
    });
  };

  // --- UIスタイル ---
  const fullScreenBackgroundStyle: React.CSSProperties = {
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
  };

  const titleStyle: React.CSSProperties = {
    textAlign: "center",
    color: "#8be9fd",
    textShadow: "0 0 10px rgba(139, 233, 253, 0.5)",
    marginBottom: "10px",
  };

  const subtitleStyle: React.CSSProperties = {
    textAlign: "center",
    color: "#e0e0e0",
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

  // --- ゲームUI本体 ---
  return (
    <div style={fullScreenBackgroundStyle}>
      <h1 style={titleStyle}>ディープ・アビス (Deep Abyss) - Room ID: {roomId}</h1>
      <p style={subtitleStyle}>深海を調査して眠れる資源を見つけ出せ！</p>

      <div style={boardWrapperStyle}>
        <MyBoard socket={socket} myPlayerId={myPlayerId} />
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
