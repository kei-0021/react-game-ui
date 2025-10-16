import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import io, { Socket } from "socket.io-client";
// ★★★ CSSのインポートを追加 ★★★
import './RoomLobby.css'; // 例として './RoomLobby.css' に保存すると想定

// 仮のSocket.IOサーバーURL (GameRoom.tsxと合わせる)
const SERVER_URL = "http://127.0.0.1:4000"; 

// ルームデータの型定義 (サーバーから受信するデータを想定)
interface Room {
    id: string;
    name: string;
    playerCount: number;
    maxPlayers: number;
    createdAt: number; // タイムスタンプ
}

// Tailwndクラスをカスタムクラスに置換
export default function RoomLobby() {
    const [roomIdInput, setRoomIdInput] = useState("");
    const [rooms, setRooms] = useState<Room[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [socket, setSocket] = useState<Socket | null>(null);
    const navigate = useNavigate();

    // ... (Socket.IO接続のロジックは変更なし) ...
    useEffect(() => {
        // ロビー接続を確立
        const lobbySocket = io(SERVER_URL);
        setSocket(lobbySocket);

        lobbySocket.on('connect', () => {
            console.log("Lobby connected. Requesting room list.");
            lobbySocket.emit('lobby:get-rooms');
            console.log("Emit 'lobby:get-rooms'.");
        });

        lobbySocket.on('lobby:rooms-list', (fetchedRooms: Room[]) => {
            console.log("Received room list:", fetchedRooms);
            fetchedRooms.sort((a, b) => b.createdAt - a.createdAt);
            setRooms(fetchedRooms);
            setIsLoading(false);
        });
        
        lobbySocket.on('lobby:room-update', () => {
            lobbySocket.emit('lobby:get-rooms');
        });

        lobbySocket.on('connect_error', (err) => {
            console.error("Lobby connection error:", err);
            setIsLoading(false);
        });

        return () => {
            lobbySocket.off('connect');
            lobbySocket.off('lobby:rooms-list');
            lobbySocket.off('lobby:room-update');
            lobbySocket.off('connect_error');
            lobbySocket.disconnect();
        };
    }, []);

    // 2. ルームに参加
    const handleJoinRoom = (id: string) => {
        if (id.trim()) {
            navigate(`/room/${id.trim()}`);
        }
    };

    // 3. 新しいルームを作成
    const handleCreateRoom = () => {
        const newRoomId = Math.random().toString(36).substring(2, 8); 
        console.log(`新しいルームを作成: ${newRoomId}`);
        handleJoinRoom(newRoomId);
    };

    // 4. UIレンダリング
    return (
        <div className="lobby-container">
            <h1 className="lobby-title">🎲 ゲームロビー 🤝</h1>
            
            {/* --- 新しいルームを作成 --- */}
            <div className="section create-room-section">
                <h2 className="section-title">新しいルームを作成</h2>
                <button 
                    onClick={handleCreateRoom}
                    className="button primary-button" // primary-buttonに変更
                    disabled={!socket || !socket.connected}
                >
                    ルームを作成
                </button>
                {!socket?.connected && (
                    <p className="status-message loading">サーバー接続中...</p>
                )}
            </div>

            {/* --- 既存のルームに参加 (ID入力) --- */}
            <div className="section join-id-section">
                <h2 className="section-title">IDで参加</h2>
                <input
                    type="text"
                    placeholder="ルームIDを入力 (例: abcde1)"
                    value={roomIdInput}
                    onChange={(e) => setRoomIdInput(e.target.value)}
                    className="input-field"
                />
                <button 
                    onClick={() => handleJoinRoom(roomIdInput)}
                    className="button success-button" // success-buttonに変更
                    disabled={!roomIdInput.trim()}
                >
                    ルームに参加
                </button>
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
                                className={`room-item ${room.playerCount >= room.maxPlayers ? 'room-item-full' : 'room-item-available'}`}
                                onClick={() => room.playerCount < room.maxPlayers && handleJoinRoom(room.id)}
                            >
                                <div className="room-info">
                                    <p className="room-name">{room.name}</p>
                                    <p className="room-id">ID: {room.id}</p>
                                </div>
                                <div className="room-status">
                                    <span className={`player-count ${room.playerCount < room.maxPlayers ? 'status-ok' : 'status-full'}`}>
                                        {room.playerCount}/{room.maxPlayers}
                                    </span>
                                    <p className="created-at">
                                        {new Date(room.createdAt).toLocaleTimeString('ja-JP')} 作成
                                    </p>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}