import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useSocket } from "../../src/hooks/useSocket";
import Board from "../components/Board";

const SERVER_URL = "http://127.0.0.1:4000";

export default function GameRoom() {
  const { roomId } = useParams<{ roomId: string }>();
  const socket = useSocket(SERVER_URL);

  const [userName, setUserName] = useState<string>('');
  const [isJoining, setIsJoining] = useState<boolean>(false);
  const [hasJoined, setHasJoined] = useState<boolean>(false);
  const [myPlayerId, setMyPlayerId] = useState<string | null>(null);

  const handleJoinRoom = useCallback(() => {
    if (!socket || !roomId || userName.trim() === '' || isJoining) return;

    setIsJoining(true);
    socket.emit("room:join", { roomId, playerName: userName.trim() });
  }, [socket, roomId, userName, isJoining]);

  useEffect(() => {
    if (!socket || !roomId) return;

    const handleAssignId = (id: string) => {
      setMyPlayerId(id);
      setHasJoined(true);
      setIsJoining(false);
    };

    socket.on("player:assign-id", handleAssignId);

    return () => {
      socket.off("player:assign-id", handleAssignId);
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
        <button onClick={handleJoinRoom} disabled={userName.trim() === '' || isJoining}>
          {isJoining ? '参加中...' : 'ルームに参加'}
        </button>
      </div>
    );
  }

  // --- 参加後、Boardのみ表示 ---
  return (
    <div style={{ padding: "20px" }}>
      <h1>Room ID: {roomId}</h1>
      <Board />
    </div>
  );
}
