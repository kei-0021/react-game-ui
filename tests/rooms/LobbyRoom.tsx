// tests/rooms/LobbyRoom.tsx
import { useEffect, useState } from 'react';
import { ControlPanel, GameParam, LobbyGameList, LobbyRoomList, RoomMeta } from 'react-game-ui';
import { useNavigate } from 'react-router-dom';
import io, { Socket } from 'socket.io-client';
import './LobbyRoom.css';

const SERVER_URL = 'http://127.0.0.1:4000';

export function LobbyRoom() {
  const [games, setGames] = useState<GameParam[]>([]);
  const [rooms, setRooms] = useState<RoomMeta[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const lobbySocket = io(SERVER_URL);
    setSocket(lobbySocket);

    lobbySocket.on('connect', () => {
      console.log('Lobby connected. Requesting room list.');
      lobbySocket.emit('lobby:get-info');

      // --- テストとして、カスタムイベント1を強制発動 ---
      lobbySocket.emit('custom:events:1');
    });

    // ゲームリスト受信
    lobbySocket.on('lobby:game-list', (data: LobbyGameList) => {
      if (!Array.isArray(data) && data.games) {
        setGames(data.games);
      }
    });

    // ルームリスト受信
    lobbySocket.on('lobby:room-list', (data: LobbyRoomList) => {
      const roomArray = Array.isArray(data) ? data : data.rooms || [];
      roomArray.sort((a, b) => b.createdAt - a.createdAt);
      setRooms(roomArray);
      setIsLoading(false);
    });

    lobbySocket.on('room-ready', () => {
      lobbySocket.emit('lobby:get-info');
    });

    return () => {
      lobbySocket.off('connect');
      lobbySocket.off('lobby:game-list');
      lobbySocket.off('lobby:room-list');
      lobbySocket.off('room-ready');
      lobbySocket.disconnect();
    };
  }, []);

  // 既存ルームに参加
  const handleJoinRoom = (room: RoomMeta) => {
    if (!room.id.trim()) return;
    navigate(`/${room.gameId || 'unknown'}/${room.id.trim()}`);
  };

  // 新しいルームを作成
  const handleCreateRoom = (gameId: string) => {
    const newRoomId = Math.random().toString(36).substring(2, 8);
    navigate(`${gameId}/${newRoomId}`);
  };

  return (
    <div className="lobby-container">
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

      <h1 className="lobby-title">🎲 ゲームロビー 🤝</h1>

      <div className="section create-room-section">
        <h2 className="section-title">新しいゲームを始める</h2>
        <div className="preset-button-group" style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
          {games.map((GameParam) => (
            <button
              key={GameParam.gameId}
              onClick={() => handleCreateRoom(GameParam.gameId)}
              className={`button primary-button`}
              disabled={!socket?.connected}
            >
              {GameParam.gameIcon} {GameParam.gameId}
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

      <div className={`control-panel-wrapper ${isPanelOpen ? 'open' : ''}`} style={{ zIndex: 999 }}>
        {socket && (
          <ControlPanel
            socket={socket}
            GameParam={games}
            isOpen={isPanelOpen}
            onToggle={() => setIsPanelOpen(!isPanelOpen)}
          />
        )}
      </div>
    </div>
  );
}
