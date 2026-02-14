import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Deck from "../../src/components/Deck";
import Dice from "../../src/components/Dice";
import ScoreBoard from "../../src/components/ScoreBoard";
import Timer from "../../src/components/Timer";
import { useSocket } from "../../src/hooks/useSocket";
import type { PlayerWithResources } from "../../src/types/playerWithResources";

const SERVER_URL = "http://127.0.0.1:4000";

// サーバーから送られてくるターン情報の型定義
interface TurnUpdatePayload {
  playerId: string;
  currentRound: number;
  currentTurnIndex: number;
}

export function SampleRoom() {
  const { roomId } = useParams<{ roomId: string }>();
  const socket = useSocket(SERVER_URL);

  const [userName, setUserName] = useState<string>("");
  const [isJoining, setIsJoining] = useState<boolean>(false);
  const [hasJoined, setHasJoined] = useState<boolean>(false);

  const [myPlayerId, setMyPlayerId] = useState<string | null>(null);
  const [players, setPlayers] = useState<PlayerWithResources[]>([]);
  const [currentPlayerId, setCurrentPlayerId] = useState<string | null>(null);

  // ラウンドの状態を追加
  const [currentRound, setCurrentRound] = useState<number>(1);

  const GAME_PRESET_ID = "sample";

  const handleJoinRoom = useCallback(() => {
    if (!socket || !roomId || userName.trim() === "" || isJoining) return;

    setIsJoining(true);
    socket.emit("room:join", {
      roomId,
      playerName: userName.trim(),
      gamePresetId: GAME_PRESET_ID,
    });
  }, [socket, roomId, userName, isJoining]);

  useEffect(() => {
    if (!socket || !roomId) return;

    const handleAssignId = (id: string) => {
      setMyPlayerId(id);
      setHasJoined(true);
      setIsJoining(false);
      console.log(`プレイヤーID: ${id} が渡されました`);
    };

    const handlePlayersUpdate = (updatedPlayers: PlayerWithResources[]) => {
      console.log("[CLIENT] players:update", updatedPlayers);
      setPlayers(updatedPlayers);
    };

    // 文字列（IDのみ）とオブジェクト（詳細データ）の両方に対応する
    const handleGameTurn = (data: TurnUpdatePayload | string) => {
      console.log("[CLIENT] game:turn received:", data);

      if (typeof data === "string") {
        // 互換性維持のため、文字列ならIDとしてセット
        setCurrentPlayerId(data);
      } else {
        // オブジェクトならIDとラウンドをセット
        setCurrentPlayerId(data.playerId);
        setCurrentRound(data.currentRound);
        console.log(`[CLIENT] Round Updated to: ${data.currentRound}`);
      }
    };

    socket.on("player:assign-id", handleAssignId);
    socket.on("players:update", handlePlayersUpdate);
    socket.on("game:turn", handleGameTurn);

    return () => {
      socket.off("player:assign-id", handleAssignId);
      socket.off("players:update", handlePlayersUpdate);
      socket.off("game:turn", handleGameTurn);
    };
  }, [socket, roomId]);

  // --- 参加前 ---
  if (!roomId) return <p>⚠️ ルームIDがURLから取得できません</p>;
  if (!socket) return <p>サーバーに接続中...</p>;

  if (!hasJoined) {
    return (
      <div style={{ textAlign: "center", marginTop: "20px" }}>
        <h2>ルーム参加</h2>
        <input
          type="text"
          placeholder="名前を入力"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          disabled={isJoining}
        />
        <button
          onClick={handleJoinRoom}
          disabled={userName.trim() === "" || isJoining}
        >
          {isJoining ? "参加中..." : "ルームに参加"}
        </button>
      </div>
    );
  }

  // --- 参加後 ---
  return (
    <div style={{ padding: "20px" }}>
      <h1>Room ID: {roomId}</h1>

      {/* ラウンド表示 */}
      <div
        style={{
          backgroundColor: "#333",
          color: "#00d4ff",
          padding: "5px 15px",
          borderRadius: "5px",
          display: "inline-block",
          fontWeight: "bold",
          marginBottom: "15px",
        }}
      >
        ROUND: {currentRound}
      </div>

      <ScoreBoard
        socket={socket}
        roomId={roomId}
        players={players}
        currentPlayerId={currentPlayerId}
        myPlayerId={myPlayerId}
      />
      <Dice socket={socket} diceId="1" roomId={roomId} />
      <Timer socket={socket} initialDuration={30} roomId={roomId}></Timer>
      <Deck
        socket={socket}
        roomId={roomId}
        deckId="numberDeck"
        name="数字カード"
      ></Deck>
    </div>
  );
}
