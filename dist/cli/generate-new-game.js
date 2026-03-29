#!/usr/bin/env node
// src/cli/generate-new-game.ts
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
export const generate = (gameName, gameIcon = '🎲') => {
    if (!gameName) {
        console.error('ゲーム名を指定してください（例: npx tsx src/cli/generate-new-game.ts Poker）');
        process.exit(1);
    }
    const lowerName = gameName.toLowerCase();
    const pascalName = gameName.charAt(0).toUpperCase() + gameName.slice(1);
    // 注入されたベースパスを優先し、なければプロジェクトルートの 'src' 固定
    const baseDir = process.env.RG_UI_BASE_DIR || path.join(process.cwd(), 'src');
    // --- CSS Module Template ---
    const cssModuleTemplate = `/* src/rooms/${pascalName}Room.module.css */
.gameContainer {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: #222;
}

.gameCanvas {
  width: 1600px;
  height: 900px;
  position: relative;
  background: #333;
  transform-origin: top left;
}

.gameHeader {
  display: flex;
  justify-content: space-between;
  padding: 10px;
  color: white;
  border-bottom: 1px solid #444;
}

.gameMain {
  display: flex;
  height: calc(100% - 60px);
}

.sidebarLeft {
  width: 250px;
  padding: 10px;
  border-right: 1px solid #444;
}

.sidebarRight {
  width: 300px;
  padding: 10px;
  border-left: 1px solid #444;
}

.playFieldContainer {
  flex: 1;
  position: relative;
}

.joinScreen {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: #1a1a1a;
  color: white;
}
`;
    // --- Server Config Template ---
    const dataTemplate = `export const ${pascalName}Data: any = {
  "gameId": "${lowerName}",
  "gameIcon": "${gameIcon}",
}`;
    const configTemplate = `import type { GameParam } from "react-game-ui";
import { type RoomConfig } from "react-game-ui/server-io-utils";

export const ${pascalName}Config: RoomConfig = {
  gameId: "${lowerName}",
  dataFiles: [],
  setup: async (): Promise<GameParam> => {
    const { ${pascalName}Data } = await import(\`./${pascalName}Data.ts?t=\${Date.now()}\`);

    const initialDraggables = {
      "piece": {
        id: "piece",
        coordinate: { x: 500, y: 500 },
        zIndex: 100,
        rotation: 0
      }
    };

    return {
      gameId: "${lowerName}",
      gameIcon: "${gameIcon}",
      maxPlayers: 4,
      initialDecks: [],
      initialBoard: {},
      draggables: initialDraggables,
      checkGameEnd: () => false,
      onGameEnd: () => ({ message: "終了" }),
      components: [],
      ...${pascalName}Data
    };
  },
};
`;
    // --- Room Component Template ---
    const roomTemplate = `import { useCallback, useEffect, useRef, useState } from "react";
import type { GameTurnUpdateData, Player, RoomJoinData, ComponentInfo } from "react-game-ui";
import {
  Deck,
  Dice,
  Draggable,
  DynamicComponent,
  PlayerId,
  PlayField,
  RemoteCursor,
  ScoreBoard,
  TokenStore,
  useSocket,
} from "react-game-ui";
import styles from "./${pascalName}Room.module.css";
import { useNavigate, useParams } from "react-router-dom";

const SERVER_URL =
  import.meta.env.MODE === "development"
    ? "http://localhost:4000"
    : "https://bg-lab.onrender.com";

const BASE_WIDTH = 1600;
const BASE_HEIGHT = 900;

export function ${pascalName}Room() {
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

  // 動的コンポーネント情報の管理
  const [componentInfo, setComponentInfo] = useState<ComponentInfo[]>([]);

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
      gameId: "${lowerName}",
      playerName: userName.trim(),
    } as RoomJoinData);
  }, [socket, roomId, userName, isJoining]);

  useEffect(() => {
    if (!socket) return;
    const onClientReady = (id: PlayerId) => {
      setMyPlayerId(id);
      setHasJoined(true);
      setIsJoining(false);
      socket.emit("client:ready", roomId);
    };
    const handlePlayersUpdate = (updatedPlayers: Player[]) => setPlayers(updatedPlayers);
    const handleGameTurn = (data: GameTurnUpdateData) => {
      setCurrentPlayerId(data.currentPlayerId);
      setCurrentRound(data.currentRoundIndex + 1);
    };

    // コンポーネント情報の同期受信
    const handleGameComponent = (data: { components: ComponentInfo[] }) => {
      setComponentInfo(data.components);
    };

    socket.on("client:ready-to-sync", onClientReady);
    socket.on("players:update", handlePlayersUpdate);
    socket.on("game:turn", handleGameTurn);
    socket.on("game:component", handleGameComponent);

    return () => {
      socket.off("client:ready-to-sync", onClientReady);
      socket.off("players:update", handlePlayersUpdate);
      socket.off("game:turn", handleGameTurn);
      socket.off("game:component", handleGameComponent);
    };
  }, [socket, roomId]);

  if (!roomId) return null;

  if (!hasJoined) {
    return (
      <div className={styles.joinScreen}>
        <div style={{ textAlign: 'center' }}>
          <h2>${gameName} 入場</h2>
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
          transform: \`scale(\${scale})\`
        }}
      >
        <header className={styles.gameHeader}>
          <h1>${gameIcon} ${gameName}</h1>
          <div>Round: {currentRound}</div>
          <button onClick={() => navigate("/")}>ロビーへ</button>
        </header>

        <main className={styles.gameMain}>
          <aside className={styles.sidebarLeft}>
            <Deck socket={socket!} roomId={roomId} deckId="main" title="山札" currentPlayerId={currentPlayerId} myPlayerId={myPlayerId} />
            <Dice sides={6} socket={socket} diceId="move" roomId={roomId} onRoll={setCurrentDiceValue} />
          </aside>

          <div className={styles.playFieldContainer}>
             {/* 動的コンポーネントのレンダリング */}
             {componentInfo.map((info) => (
               <DynamicComponent 
                 key={info.id} 
                 type={info.type} 
                 props={info.props} 
                 socket={socket!} 
                 roomId={roomId!} 
                 myPlayerId={myPlayerId}
                 currentPlayerId={currentPlayerId}
                 players={players}
                 containerRef={containerRef}
               />
             ))}

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
`;
    const paths = {
        data: path.join(baseDir, 'server', `${pascalName}Data.ts`),
        config: path.join(baseDir, 'server', `${pascalName}Config.ts`),
        room: path.join(baseDir, 'rooms', `${pascalName}Room.tsx`),
        css: path.join(baseDir, 'rooms', `${pascalName}Room.module.css`),
    };
    Object.values(paths).forEach((p) => {
        const dir = path.dirname(p);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
    });
    fs.writeFileSync(paths.data, dataTemplate);
    fs.writeFileSync(paths.config, configTemplate);
    fs.writeFileSync(paths.room, roomTemplate);
    fs.writeFileSync(paths.css, cssModuleTemplate);
    console.log(`✅ 生成完了: ${gameName} at ${baseDir}`);
};
// 直接実行時の処理
const __filename = fileURLToPath(import.meta.url);
if (process.argv[1] &&
    (process.argv[1].endsWith('generate-new-game.js') || process.argv[1].endsWith('generate-new-game.ts'))) {
    generate(process.argv[2], process.argv[3]);
}
