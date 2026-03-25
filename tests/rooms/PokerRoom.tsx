import { useCallback, useEffect, useRef, useState } from "react";
import type { GameTurnUpdateData, Player, RoomJoinData } from "react-game-ui";
import {
  Deck,
  Dice,
  Draggable,
  PlayField,
  RemoteCursor,
  ScoreBoard,
  TokenStore,
  useSocket,
} from "react-game-ui";
import styles from "./pokerRoom.module.css";
import { useNavigate, useParams } from "react-router-dom";

const SERVER_URL =
  import.meta.env.MODE === "development"
    ? "http://localhost:4000"
    : "https://bg-lab.onrender.com";

const BASE_WIDTH = 1600;
const BASE_HEIGHT = 900;

export function PokerRoom() {
  const { roomId } = useParams<{ roomId: string }>();
  const socket = useSocket(SERVER_URL);
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);

  const [userName, setUserName] = useState<string>("");
  const [isJoining, setIsJoining] = useState<boolean>(false);
  const [hasJoined, setHasJoined] = useState<boolean>(false);
  const [myPlayerId, setMyPlayerId] = useState<string | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentPlayerId, setCurrentPlayerId] = useState<string | null>(null);
  const [currentRound, setCurrentRound] = useState<number>(1);
  const [currentDiceValue, setCurrentDiceValue] = useState<number>(1);
  const [scale, setScale] = useState<number>(1);

  useEffect(() => {
    const handleResize = () => {
      const scaleX = window.innerWidth / BASE_WIDTH;
      const scaleY = window.innerHeight / BASE_HEIGHT;
      setScale(Math.min(scaleX, scaleY));
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleJoinRoom = useCallback(() => {
    if (!socket || userName.trim() === "" || isJoining) return;
    setIsJoining(true);
    socket.emit("room:join", {
      roomId,
      gameId: "poker",
      playerName: userName.trim(),
    } as RoomJoinData);
  }, [socket, roomId, userName, isJoining]);

  useEffect(() => {
    if (!socket) return;
    const handleAssignId = (id: Player["id"]) => {
      setMyPlayerId(id);
      setHasJoined(true);
      setIsJoining(false);
    };
    const onClientReady = () => {
      socket.emit("client:ready", roomId);
    };
    const handlePlayersUpdate = (updatedPlayers: Player[]) => setPlayers(updatedPlayers);
    const handleGameTurn = (data: GameTurnUpdateData) => {
      setCurrentPlayerId(data.currentPlayerId);
      setCurrentRound(data.currentRoundIndex + 1);
    };

    socket.on("player:assign-id", handleAssignId);
    socket.on("client:ready-to-sync", onClientReady);
    socket.on("players:update", handlePlayersUpdate);
    socket.on("game:turn", handleGameTurn);

    return () => {
      socket.off("player:assign-id", handleAssignId);
      socket.off("players:update", handlePlayersUpdate);
      socket.off("game:turn", handleGameTurn);
    };
  }, [socket, roomId]);

  if (!roomId) return null;

  if (!hasJoined) {
    return (
      <div className={styles.joinScreen}>
        <div style={{ textAlign: 'center' }}>
          <h2>poker 入場</h2>
          <input
            type="text"
            autoFocus
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            placeholder="お名前"
            onKeyDown={(e) => e.key === "Enter" && handleJoinRoom()}
            style={{ padding: '8px', borderRadius: '4px', border: 'none', color: '#000' }}
          />
          <button onClick={handleJoinRoom} disabled={isJoining} style={{ marginLeft: '8px', padding: '8px 16px', cursor: 'pointer' }}>
            {isJoining ? "入場中" : "入場"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.gameContainer}>
      <div
        ref={containerRef}
        className={styles.gameCanvas}
        style={{
          transform: `scale(${scale})`
        }}
      >
        <header className={styles.gameHeader}>
          <h1>🎲 poker</h1>
          <div>Round: {currentRound}</div>
          <button onClick={() => navigate("/")}>ロビーへ</button>
        </header>

        <main className={styles.gameMain}>
          <aside className={styles.sidebarLeft}>
            <Deck socket={socket!} roomId={roomId} deckId="main" title="山札" currentPlayerId={currentPlayerId} myPlayerId={myPlayerId} />
            <Dice sides={6} socket={socket} diceId="move" roomId={roomId} onRoll={setCurrentDiceValue} />
          </aside>

          <div className={styles.playFieldContainer}>
             <RemoteCursor socket={socket!} roomId={roomId} myPlayerId={myPlayerId} players={players.map(p => ({ name: p.name, socketId: String(p.id), color: p.color }))} scale={scale} fixedContainerRef={containerRef} visible={true} isRelative={false} />
             <PlayField socket={socket} roomId={roomId} deckId="main" players={players} myPlayerId={myPlayerId} layoutMode="free" />
             <Draggable socket={socket} roomId={roomId} draggableId="piece" containerRef={containerRef}/>
          </div>

          <aside className={styles.sidebarRight}>
            <ScoreBoard socket={socket!} roomId={roomId} players={players} currentPlayerId={currentPlayerId} myPlayerId={myPlayerId} />
          </aside>
        </main>
        
        <TokenStore socket={socket} roomId={roomId} tokenStoreId="chips" title="所持チップ" />
      </div>
    </div>
  );
}
