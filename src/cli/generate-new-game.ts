#!/usr/bin/env node
// src/cli/generate-new-game.ts
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const generate = (gameName: string, gameIcon: string = '🎲') => {
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
.roomContainer {
  width: 100vw;
  height: 100vh;
  overflow: auto;
  background: #222;
  user-select: none;
}

.roomCanvas {
  width: 1600px;
  height: 900px;
  position: relative;
  background: #333;
  transform-origin: top left;
  display: grid;
  grid-template-columns: repeat(16, 1fr);
  grid-template-rows: repeat(9, 1fr);
}

.gameHeader {
  grid-column: 1 / -1;
  grid-row: 1 / 2;
  display: flex;
  justify-content: space-between;
  padding: 10px;
  color: white;
  border-bottom: 1px solid #444;
  z-index: 10;
  background: rgba(34, 34, 34, 0.8);
}

.gameMain {
  grid-column: 1 / -1;
  grid-row: 2 / -1;
  display: flex;
  z-index: 1;
  pointer-events: none;
}

.sidebarLeft,
.sidebarRight,
.playFieldContainer {
  pointer-events: auto;
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
  const roomTemplate = `import { DropContainer } from '@/gui/DropContainer';
import { useCallback, useEffect, useRef, useState } from 'react';
import type {
  ComponentInfo,
  GameParam,
  GameTurnUpdateData,
  LobbyGameList,
  Player,
  PlayerId,
  RoomJoinData,
} from 'react-game-ui';
import {
  ControlPanel,
  Deck,
  DynamicComponent,
  PlayField,
  RemoteCursor,
  ScoreBoard,
  TokenStore,
  useSocket,
} from 'react-game-ui';
import { useNavigate, useParams } from 'react-router-dom';
import styles from "./${pascalName}Room.module.css";

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

  // --- 参加・プレイヤー状態 ---
  const [userName, setUserName] = useState<string>('');
  const [isJoining, setIsJoining] = useState<boolean>(false);
  const [hasJoined, setHasJoined] = useState<boolean>(false);
  const [myPlayerId, setMyPlayerId] = useState<string | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);

  // --- ゲーム進行状態 ---
  const [currentPlayerId, setCurrentPlayerId] = useState<string | null>(null);
  const [currentRound, setCurrentRound] = useState<number>(1);
  const [scale, setScale] = useState<number>(1);

  // --- 動的コンポーネント & パラメータ管理 ---
  const [componentInfo, setComponentInfo] = useState<ComponentInfo[]>([]);
  const [games, setGames] = useState<GameParam[]>([]);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  // 現在のゲーム設定（poker）を抽出
  const currentGameParam = games.find((g) => g.gameId === '${lowerName}');

  // ウィンドウリサイズに応じたスケーリング
  useEffect(() => {
    const handleResize = () => {
      const scaleX = window.innerWidth / BASE_WIDTH;
      setScale(Math.max(scaleX, 0.5));
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 入場処理
  const handleJoinRoom = useCallback(() => {
    if (!socket || userName.trim() === '' || isJoining) return;
    setIsJoining(true);
    socket.emit('room:join', {
      roomId,
      gameId: "${lowerName}",
      playerName: userName.trim(),
    } as RoomJoinData);
  }, [socket, roomId, userName, isJoining]);

  // Socket.IO イベントリスナー
  useEffect(() => {
    if (!socket) return;

    const onClientReady = (id: PlayerId) => {
      setMyPlayerId(id);
      setHasJoined(true);
      setIsJoining(false);
      socket.emit('client:ready', roomId);
      socket.emit('lobby:get-info');
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

    // ゲームリスト受信
    const handleGameList = (data: LobbyGameList) => {
      const list = Array.isArray(data) ? data : data.games ? Object.values(data.games) : [];
      setGames(list.filter((game) => game.gameId === 'poker'));
    };

    socket.on('client:ready-to-sync', onClientReady);
    socket.on('players:update', handlePlayersUpdate);
    socket.on('game:turn', handleGameTurn);
    socket.on('game:component', handleGameComponent);
    socket.on('lobby:game-list', handleGameList);

    return () => {
      socket.off('client:ready-to-sync', onClientReady);
      socket.off('players:update', handlePlayersUpdate);
      socket.off('game:turn', handleGameTurn);
      socket.off('game:component', handleGameComponent);
      socket.off('lobby:game-list', handleGameList);
    };
  }, [socket, roomId]);

  if (!roomId) return null;

  // 入場前画面
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
            onKeyDown={(e) => e.key === 'Enter' && handleJoinRoom()}
            style={{ padding: '8px', borderRadius: '4px', border: 'none', color: '#000' }}
          />
          <button
            onClick={handleJoinRoom}
            disabled={isJoining}
            style={{ marginLeft: '8px', padding: '8px 16px', cursor: 'pointer' }}
          >
            {isJoining ? '入場中' : '入場'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.roomContainer}>
      <div
        ref={containerRef}
        className={styles.roomCanvas}
        style={{
          transform: \`scale(\${scale})\`,
          transformOrigin: 'top center',
          marginRight: isPanelOpen ? '350px' : '0',
          transition: 'margin 0.3s ease, transform 0.3s ease',
        }}
      >
        <DropContainer
          scale={scale}
          containerRef={containerRef}
          socket={socket!}
          roomId={roomId!}
          componentInfo={componentInfo}
          gameParam={currentGameParam as GameParam}
          setComponentInfo={setComponentInfo}
        >
          {/* パネルが開いている時だけ背後に敷く透明なレイヤー */}
          {isPanelOpen && (
            <div
              className="panel-overlay"
              onClick={() => setIsPanelOpen(false)}
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                zIndex: 998,
                background: 'transparent',
              }}
            />
          )}

          <header className={styles.gameHeader}>
          <h1>${gameIcon} ${gameName}</h1>
            <div className={styles.roundLabel}>Round: {currentRound}</div>
            <button onClick={() => navigate('/')} className={styles.backButton}>
              ロビーへ
            </button>
          </header>

          <main className={styles.gameMain}>
            {/* 左サイドバー：固定コンポーネント */}
            <aside className={styles.sidebarLeft}>
              <Deck
                socket={socket!}
                roomId={roomId}
                deckId="main"
                title="山札"
                currentPlayerId={currentPlayerId}
                myPlayerId={myPlayerId}
              />
            </aside>

            {/* メインフィールド */}
            <div className={styles.playFieldContainer}>
              <RemoteCursor
                socket={socket!}
                roomId={roomId}
                myPlayerId={myPlayerId}
                players={players.map((p) => ({
                  name: p.name,
                  socketId: String(p.id),
                  color: p.color,
                }))}
                scale={scale}
                fixedContainerRef={containerRef}
                visible={true}
                isRelative={false}
              />
              <PlayField
                socket={socket!}
                roomId={roomId}
                deckId="main"
                players={players}
                myPlayerId={myPlayerId}
                layoutMode="free"
              />
            </div>

            {/* 右サイドバー：スコア管理 */}
            <aside className={styles.sidebarRight}>
              <ScoreBoard
                socket={socket!}
                roomId={roomId}
                players={players}
                currentPlayerId={currentPlayerId}
                myPlayerId={myPlayerId}
              />
            </aside>
          </main>

          {/* 共通トークンエリア */}
          <TokenStore socket={socket!} roomId={roomId} tokenStoreId="chips" title="所持チップ" />

          {/* 動的に配置される全コンポーネント */}
          {componentInfo.map((info) => (
            <DynamicComponent
              key={info.id}
              type={info.type}
              props={info.props}
              socket={socket!}
              roomId={roomId!}
              myPlayerId={myPlayerId!}
              currentPlayerId={currentPlayerId!}
              players={players}
              containerRef={containerRef}
            />
          ))}
        </DropContainer>
      </div>

      {/* 管理パネル */}
      <ControlPanel
        socket={socket!}
        GameParam={currentGameParam ? [currentGameParam] : []}
        containerRef={containerRef}
        isOpen={isPanelOpen}
        onToggle={() => setIsPanelOpen(!isPanelOpen)}
      />
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
if (
  process.argv[1] &&
  (process.argv[1].endsWith('generate-new-game.js') || process.argv[1].endsWith('generate-new-game.ts'))
) {
  generate(process.argv[2], process.argv[3]);
}
