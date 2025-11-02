import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import io, { Socket } from "socket.io-client";
// ★★★ CSSのインポートを追加 ★★★
import './LobbyRoom.css';

// 仮のSocket.IOサーバーURL (GameRoom.tsxと合わせる)
const SERVER_URL = "http://127.0.0.1:4000"; 

// サーバーで定義されたゲームプリセットIDのリスト
// 💡 修正1: pathSegment を追加。遷移先のURLのセグメントとして使用します。
const GAME_PRESETS = [
    { id: 'deep-sea', name: '深海大冒険', pathSegment: 'deepsea', buttonClass: 'primary-button' },
    { id: 'dice-only', name: 'シンプルダイス', pathSegment: 'dice', buttonClass: 'primary-button' },
];

// ルームデータの型定義 (サーバーから受信するデータを想定)
interface Room {
    id: string;
    name: string;
    playerCount: number;
    maxPlayers: number;
    createdAt: number; // タイムスタンプ
}

export default function LobbyRoom() {
    const [rooms, setRooms] = useState<Room[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [socket, setSocket] = useState<Socket | null>(null);
    const navigate = useNavigate();

    // ... (Socket.IO接続のロジックは変更なし) ...
    useEffect(() => {
        const lobbySocket = io(SERVER_URL);
        setSocket(lobbySocket);

        lobbySocket.on('connect', () => {
            console.log("Lobby connected. Requesting room list.");
            lobbySocket.emit('lobby:get-rooms');

            // --- テストとして、カスタムイベント1を強制発動 ---
            lobbySocket.emit("custom:events:1");
        });

        // ルームリスト受信
        lobbySocket.on('lobby:rooms-list', (fetchedRooms: Room[]) => {
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

    // 2. ルームに参加 (既存ルーム参加時は、GameRoom側でパスからコンポーネントが決定されている)
    const handleJoinRoom = (id: string) => {
        if (id.trim()) {
            // 既存ルームの参加時は、既にロビーリストやID入力欄でルームのURLパスが特定されている前提
            // 今回は、最も汎用的な `/room/:roomId` パスへの遷移を維持するか、
            // ユーザーが完全なパスを入力/選択することを要求する設計が必要です。
            // シンプルにするため、ここではID入力からの遷移は `/room/:roomId` (main.jsの最も一般的なルート) に導きます。
            navigate(`/room/${id.trim()}`);
        }
    };

    // 3. 新しいルームを作成 (プリセットオブジェクト全体を引数で受け取る)
    // 💡 修正2: 遷移パスを gamePresetId に基づいて動的に決定
    const handleCreateRoom = (preset: typeof GAME_PRESETS[0]) => {
        const newRoomId = Math.random().toString(36).substring(2, 8); 
        console.log(`新しいルームを作成: ${newRoomId}, プリセット: ${preset.id}`);
        
        // パスセグメントとルームID、そしてクエリパラメータでプリセットIDを渡す
        // 例: /game/deepsea/abcde1?presetId=deep-sea
        navigate(`/game/${preset.pathSegment}/${newRoomId}?presetId=${preset.id}`);
    };

    // 4. UIレンダリング
    return (
        <div className="lobby-container">
            <h1 className="lobby-title">🎲 ゲームロビー 🤝</h1>
            
            {/* --- 新しいルームを作成 --- */}
            <div className="section create-room-section">
                <h2 className="section-title">新しいゲームを始める</h2>
                
                {/* 💡 修正3: プリセット選択ボタンを横に並べる */}
                <div className="preset-button-group" style={{ 
                        display: 'flex', 
                        height: '130px', 
                        gap: '15px', 
                        justifyContent: 'center' 
                    }}>
                    {GAME_PRESETS.map((preset) => (
                        <button 
                            key={preset.id}
                            // 💡 修正4: プリセットオブジェクト全体を渡す
                            onClick={() => handleCreateRoom(preset)}
                            className={`button ${preset.buttonClass}`}
                            disabled={!socket || !socket.connected}
                            title={preset.name}
                        >
                            {preset.name}
                        </button>
                    ))}
                </div>
                
                {!socket?.connected && (
                    <p className="status-message loading">サーバー接続中...</p>
                )}
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
                                // 💡 既存ルームへの参加も汎用的な handleJoinRoom を利用
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