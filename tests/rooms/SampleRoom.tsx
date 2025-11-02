import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Dice from "../../src/components/Dice";
import ScoreBoard from "../../src/components/ScoreBoard";
import { useSocket } from "../../src/hooks/useSocket";
import type { PlayerWithResources } from "../../src/types/playerWithResources";

const SERVER_URL = "http://127.0.0.1:4000";

export default function GameRoom() {
  const { roomId } = useParams<{ roomId: string }>();
  const socket = useSocket(SERVER_URL);

  const [userName, setUserName] = useState<string>('');
  const [isJoining, setIsJoining] = useState<boolean>(false);
  const [hasJoined, setHasJoined] = useState<boolean>(false);

  const [myPlayerId, setMyPlayerId] = useState<string | null>(null);
  const [players, setPlayers] = useState<PlayerWithResources[]>([]);
  const [currentPlayerId, setCurrentPlayerId] = useState<string | null>(null);
  
  const GAME_PRESET_ID = 'dice-only';

  const handleJoinRoom = useCallback(() => {
    if (!socket || !roomId || userName.trim() === '' || isJoining) return;

    setIsJoining(true);
    socket.emit("room:join", { 
      roomId, 
      playerName: userName.trim(),
      gamePresetId: GAME_PRESET_ID
    });
  }, [socket, roomId, userName, isJoining]);

  useEffect(() => {
    if (!socket || !roomId) return;

    const handleAssignId = (id: string) => {
      setMyPlayerId(id);
      setHasJoined(true);
      setIsJoining(false);
      console.log(`プレイヤーID: ${id} が渡されました`)
    };

    const handlePlayersUpdate = (updatedPlayers: PlayerWithResources[]) => {
      console.log("[CLIENT] players:update", updatedPlayers);
      setPlayers(updatedPlayers);
    };

    const handleGameTurn = (id: string) => {
      console.log("[CLIENT] game:turn:", id);
      setCurrentPlayerId(id);
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
      <ScoreBoard
        socket={socket}
        roomId={roomId}
        players={players}
        currentPlayerId={currentPlayerId}
        myPlayerId={myPlayerId}
      />
      <Dice socket={socket} diceId="1" roomId={roomId}/>
    </div>
  );
}
