#!/usr/bin/env node
// src/cli/init.ts
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
export const init = () => {
    const cwd = process.cwd();
    const baseDir = process.env.RG_UI_BASE_DIR || path.join(cwd, 'src');
    console.log(`🚀 Initializing react-game-ui project in: ${baseDir}`);
    const dirs = [baseDir, path.join(baseDir, 'rooms'), path.join(baseDir, 'server'), path.join(baseDir, 'constants')];
    dirs.forEach((dir) => {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
            console.log(`Created directory: ${path.relative(cwd, dir)}`);
        }
    });
    const d = '$';
    const gamesContent = `export interface GameEntry {
  id: string;
  name: string;
  icon: string;
}

export const GAME_LIST: GameEntry[] = [
  { id: "sample", name: "Sample", icon: "⬛️" },
];
`;
    const mainContent = `import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import LobbyRoom from "./rooms/LobbyRoom.js";

const roomModules = import.meta.glob("./rooms/*Room.tsx", { eager: true });

const autoRoutes = Object.entries(roomModules)
  .filter(([path]) => !path.includes("LobbyRoom"))
  .map(([path, module]: [string, any]) => {
    const fileName = path.split("/").pop()?.replace(".tsx", "") || "";
    const routePath = fileName.replace(/Room$/, "").toLowerCase();

    const RoomComponent =
      module[fileName] ||
      module.default ||
      Object.values(module).find((val) => typeof val === "function");

    return {
      path: \`/${d}{routePath}/:roomId\`,
      Component: RoomComponent,
      key: fileName,
    };
  })
  .filter((route) => route.Component);

console.log(\`Total games registered: ${d}{autoRoutes.length}\`);
console.table(autoRoutes.map((r) => ({ file: r.key, url: r.path })));

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LobbyRoom />} />
        {autoRoutes.map(({ path, Component, key }) => (
          <Route key={key} path={path} element={<Component />} />
        ))}
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
);
`;
    const lobbyContent = `import { useEffect, useState } from "react";
import type { RoomMeta } from "react-game-ui";
import { useNavigate } from "react-router-dom";
import io, { Socket } from "socket.io-client";
import { GAME_LIST } from "../constants/games";
import "./LobbyRoom.css";

const SERVER_URL =
  import.meta.env.MODE === "development"
    ? "http://localhost:4000"
    : "https://bg-lab.onrender.com";

const GAME_DISPLAY_NAMES = Object.fromEntries(
  GAME_LIST.map((g) => [g.id, g.name]),
);
const GAME_ICONS = Object.fromEntries(GAME_LIST.map((g) => [g.id, g.icon]));

export default function LobbyRoom() {
  const [rooms, setRooms] = useState<RoomMeta[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [socket, setSocket] = useState<Socket | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const lobbySocket = io(SERVER_URL);
    setSocket(lobbySocket);

    lobbySocket.on("connect", () => {
      lobbySocket.emit("lobby:get-rooms");
    });

    lobbySocket.on("lobby:rooms-list", (fetchedRooms: RoomMeta[]) => {
      fetchedRooms.sort((a, b) => b.createdAt - a.createdAt);
      setRooms(fetchedRooms);
      setIsLoading(false);
    });

    lobbySocket.on("lobby:room-update", () => {
      lobbySocket.emit("lobby:get-rooms");
    });

    return () => {
      lobbySocket.disconnect();
    };
  }, []);

  const handleJoinRoom = (room: RoomMeta) => {
    if (!room.id.trim()) return;
    navigate(\`/${d}{room.gameId || "unknown"}/${d}{room.id.trim()}\`);
  };

  const handleCreateRoom = (gameId: string) => {
    const newRoomId = Math.random().toString(36).substring(2, 8);
    navigate(\`/${d}{gameId}/${d}{newRoomId}\`);
  };

  return (
    <div className="lobby-container">
      <h1 className="lobby-title">react-game-ui</h1>
      <div className="section create-room-section">
        <h2 className="section-title">新しいゲームを始める</h2>
        <div className="button-group">
          {d}{GAME_LIST.map((game) => (
            <button
              key={game.id}
              onClick={() => handleCreateRoom(game.id)}
              className="button primary-button"
              disabled={!socket?.connected}
            >
              <span style={{ fontSize: "24px", marginBottom: "8px" }}>
                {d}{game.icon}
              </span>
              {d}{game.name}
            </button>
          ))}
        </div>
      </div>
      <div className="section room-list-section">
        <h2 className="section-title">公開ルーム一覧</h2>
        {d}{isLoading ? (
          <p className="status-message">ルームリストを読み込み中...</p>
        ) : rooms.length === 0 ? (
          <p className="status-message">
            現在、公開されているルームはありません。
          </p>
        ) : (
          <ul className="room-list">
            {d}{rooms.map((room) => {
              const isFull =
                room.maxPlayers != null && room.playerCount >= room.maxPlayers;
              return (
                <li
                  key={room.id}
                  className={\`room-item ${d}{
                    isFull ? "room-item-full" : "room-item-available"
                  }\`}
                  onClick={() => !isFull && handleJoinRoom(room)}
                >
                  <div className="room-game-label">
                    {d}{GAME_ICONS[room.gameId] || "🎲"}{" "}
                    {d}{GAME_DISPLAY_NAMES[room.gameId] || room.id}
                  </div>
                  <div className="room-info-content">
                    <div className="room-main-details">
                      <span className="room-name">
                        {d}{(room.gameId || "UNKNOWN").toUpperCase()} ROOM
                      </span>
                      <span className="room-id">RoomID: {d}{room.id}</span>
                    </div>
                    <div className="room-meta-details">
                      <span className="player-count">
                        {d}{room.playerCount}{" "}
                        {d}{room.maxPlayers != null ? \`/ ${d}{room.maxPlayers}\` : ""}{" "}
                        Players
                      </span>
                      <span className="room-created-at">
                        Created at:{" "}
                        {d}{new Date(room.createdAt).toLocaleTimeString("ja-JP", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
`;
    const lobbyCssContent = `:root {
  --color-bg-canvas: #d7d2c4;
  --color-wood-dark: #2c3e50;
  --color-accent-orange: #d35400;
  --color-box-shadow: #a04000;
  --color-text-main: #2c3e50;
  --color-text-sub: #7f8c8d;
}
body {
  background-color: var(--color-bg-canvas);
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
  background-size: 50px 50px;
  color: var(--color-text-main);
  font-family: "Georgia", "Hiragino Mincho ProN", serif;
  margin: 0;
}
.lobby-container {
  padding: 60px 40px;
  max-width: 1000px;
  margin: 40px auto;
}
.lobby-title {
  font-size: 36px;
  font-weight: 900;
  text-align: center;
  margin-bottom: 60px;
  letter-spacing: 0.2em;
  color: var(--color-wood-dark);
}
.create-room-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60px 40px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  margin-bottom: 80px;
}
.button-group {
  display: flex;
  flex-direction: row;
  gap: 25px;
  justify-content: center;
  width: 100%;
}
.primary-button {
  appearance: none;
  background: linear-gradient(135deg, #e67e22, #d35400);
  color: white;
  width: 200px;
  flex-shrink: 0;
  aspect-ratio: 3 / 4;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  font-size: 16px;
  font-weight: 800;
  padding: 20px;
  box-shadow: 6px 6px 0px var(--color-box-shadow);
  transition: filter 0.1s ease;
}
.primary-button::before {
  content: "NEW GAME";
  font-size: 9px;
  letter-spacing: 0.2em;
  margin-bottom: 8px;
  opacity: 0.8;
}
.primary-button:hover {
  filter: brightness(1.1);
}
.primary-button:active {
  transform: translate(4px, 4px);
  box-shadow: 2px 2px 0px var(--color-box-shadow);
}
.section-title {
  font-size: 24px;
  font-weight: 800;
  margin-bottom: 30px;
  color: var(--color-wood-dark);
}
.room-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 0;
  list-style: none;
}
.room-item {
  background-color: white;
  display: flex;
  flex-direction: row;
  align-items: stretch;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-shadow: 0 4px 0px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  height: 100px;
  transition: border-color 0.2s;
  cursor: pointer;
}
.room-item-available:hover {
  border-color: var(--color-accent-orange);
}
.room-game-label {
  width: 140px;
  background-color: var(--color-wood-dark);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  font-weight: bold;
  padding: 10px;
  flex-shrink: 0;
}
.room-info-content {
  flex: 1;
  padding: 0 25px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.room-main-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.room-name {
  font-size: 20px;
  font-weight: 800;
  color: var(--color-wood-dark);
}
.room-id {
  font-size: 12px;
  color: var(--color-text-sub);
  font-family: monospace;
}
.room-meta-details {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
}
.player-count {
  font-size: 14px;
  font-weight: bold;
  color: var(--color-wood-dark);
  border: 2px solid var(--color-wood-dark);
  padding: 4px 16px;
  border-radius: 20px;
}
.room-created-at {
  font-size: 12px;
  color: var(--color-text-sub);
}
`;
    const files = {
        registry: {
            path: path.join(baseDir, 'constants', 'games.ts'),
            content: gamesContent,
        },
        main: {
            path: path.join(baseDir, 'main.tsx'),
            content: mainContent,
        },
        lobby: {
            path: path.join(baseDir, 'rooms', 'LobbyRoom.tsx'),
            content: lobbyContent,
        },
        lobbyCss: {
            path: path.join(baseDir, 'rooms', 'LobbyRoom.css'),
            content: lobbyCssContent,
        },
    };
    Object.entries(files).forEach(([name, info]) => {
        fs.writeFileSync(info.path, info.content);
        console.log(`✨ Initialized (Overwritten): ${path.relative(cwd, info.path)}`);
    });
    console.log('\n🔥 react-game-ui: All systems reset. Ready to play.');
};
const __filename = fileURLToPath(import.meta.url);
if (process.argv[1] && (process.argv[1].endsWith('init.js') || process.argv[1].endsWith('init.ts'))) {
    init();
}
