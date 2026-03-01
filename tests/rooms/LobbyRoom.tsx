import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import io, { Socket } from 'socket.io-client';
import { RoomMeta } from '../../src/types/server';
import './LobbyRoom.css';

const SERVER_URL = 'http://127.0.0.1:4000';

const GAME_PRESETS = [
  {
    id: 'sample',
    name: 'サンプル',
    pathSegment: 'sample',
    buttonClass: 'primary-button',
  },
  {
    id: 'deepabyss',
    name: '深海大冒険',
    pathSegment: 'deepabyss',
    buttonClass: 'primary-button',
  },
];

export function LobbyRoom() {
  const [rooms, setRooms] = useState<RoomMeta[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [socket, setSocket] = useState<Socket | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const lobbySocket = io(SERVER_URL);
    setSocket(lobbySocket);

    lobbySocket.on('connect', () => {
      console.log('Lobby connected. Requesting room list.');
      lobbySocket.emit('lobby:get-rooms');

      // --- テストとして、カスタムイベント1を強制発動 ---
      lobbySocket.emit('custom:events:1');
    });

    // ルームリスト受信
    lobbySocket.on('lobby:rooms-list', (fetchedRooms: RoomMeta[]) => {
      fetchedRooms.sort((a, b) => b.createdAt - a.createdAt);
      setRooms(fetchedRooms);
      setIsLoading(false);
    });

    lobbySocket.on('lobby:room-update', () => {
      lobbySocket.emit('lobby:get-rooms');
    });

    return () => {
      lobbySocket.off('connect');
      lobbySocket.off('lobby:rooms-list');
      lobbySocket.off('lobby:room-update');
      lobbySocket.disconnect();
    };
  }, []);

  // 1. 既存ルームに参加
  const handleJoinRoom = (roomMeta: RoomMeta) => {
    const preset = GAME_PRESETS.find((p) => p.id === roomMeta.gameId || p.name === roomMeta.gameId);
    const segment = preset ? preset.pathSegment : 'sample';

    navigate(`/game/${segment}/${roomMeta.id}`);
  };

  // 2. 新しいルームを作成
  const handleCreateRoom = (preset: (typeof GAME_PRESETS)[0]) => {
    const newRoomId = Math.random().toString(36).substring(2, 8);
    navigate(`/game/${preset.pathSegment}/${newRoomId}`);
  };

  return (
    <div className="lobby-container">
      <h1 className="lobby-title">🎲 ゲームロビー 🤝</h1>

      <div className="section create-room-section">
        <h2 className="section-title">新しいゲームを始める</h2>
        <div className="preset-button-group" style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
          {GAME_PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => handleCreateRoom(preset)}
              className={`button ${preset.buttonClass}`}
              disabled={!socket?.connected}
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      {/* --- 既存ルーム一覧 --- */}
      <div className="section room-list-section">
        <h2 className="section-title list-header">公開ルーム一覧</h2>
        {isLoading ? (
          <p className="status-message">ルームリストを読み込み中...</p>
        ) : rooms.length === 0 ? (
          <p className="status-message">現在、公開されているルームはありません。</p>
        ) : (
          <ul className="room-list">
            {rooms.map((room) => (
              <li
                key={room.id}
                className={`room-item ${
                  room.maxPlayers && room.playerCount >= room.maxPlayers ? 'room-item-full' : 'room-item-available'
                }`}
                onClick={() => (!room.maxPlayers || room.playerCount < room.maxPlayers) && handleJoinRoom(room)}
              >
                <div className="room-info">
                  <p className="room-game-name">【{(room.gameId || 'UNKNOWN').toUpperCase()}】</p>
                  <p className="room-id">ID: {room.id}</p>
                </div>
                <div className="room-status">
                  <span
                    className={`player-count ${
                      !room.maxPlayers || room.playerCount < room.maxPlayers ? 'status-ok' : 'status-full'
                    }`}
                  >
                    {room.playerCount}
                    {room.maxPlayers ? `/${room.maxPlayers}` : ''}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
