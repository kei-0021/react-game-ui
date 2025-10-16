import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import io, { Socket } from "socket.io-client";

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

export default function RoomLobby() {
    const [roomIdInput, setRoomIdInput] = useState("");
    const [rooms, setRooms] = useState<Room[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [socket, setSocket] = useState<Socket | null>(null);
    const navigate = useNavigate();

    // 1. Socket.IO接続の確立とイベントリスナーの設定
    useEffect(() => {
        // ロビー接続を確立
        const lobbySocket = io(SERVER_URL);
        setSocket(lobbySocket);

        // 接続が確立したら、ルームリストを要求
        lobbySocket.on('connect', () => {
            console.log("Lobby connected. Requesting room list.");
            
            // ★★★ 修正箇所: 不必要な遅延を削除 ★★★
            // connectイベント内であれば、即座に emit しても問題ありません。
            lobbySocket.emit('lobby:get-rooms');
            console.log("Emit 'lobby:get-rooms'.");
        });

        // サーバーからルームリストを受信
        lobbySocket.on('lobby:rooms-list', (fetchedRooms: Room[]) => {
            console.log("Received room list:", fetchedRooms);
            
            // 作成日で降順ソート (最新のルームが上)
            fetchedRooms.sort((a, b) => b.createdAt - a.createdAt);
            
            setRooms(fetchedRooms);
            setIsLoading(false);
        });
        
        // サーバー側でルームが作成・削除された際など、リストが更新されたときに再取得
        lobbySocket.on('lobby:room-update', () => {
            lobbySocket.emit('lobby:get-rooms');
        });

        // エラーハンドリング
        lobbySocket.on('connect_error', (err) => {
            console.error("Lobby connection error:", err);
            setIsLoading(false);
        });

        // クリーンアップ: コンポーネントがアンマウントされたらソケット接続を閉じる
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
            // ゲームルームへ遷移。GameRoomコンポーネントでルーム参加処理を行う
            navigate(`/room/${id.trim()}`);
        }
    };

    // 3. 新しいルームを作成
    const handleCreateRoom = () => {
        // クライアント側でランダムIDを生成
        const newRoomId = Math.random().toString(36).substring(2, 8); 
        console.log(`新しいルームを作成: ${newRoomId}`);
        
        // 新しいルームIDでゲームルームへ遷移。
        handleJoinRoom(newRoomId);
    };

    // 4. UIレンダリング
    return (
        <div className="p-6 max-w-lg mx-auto bg-gray-900 shadow-2xl rounded-xl text-white">
            <h1 className="text-3xl font-bold text-center mb-6 text-cyan-400">🎲 ゲームロビー 🤝</h1>
            
            {/* --- 新しいルームを作成 --- */}
            <div className="mb-6 p-4 bg-gray-800 rounded-lg border border-cyan-700">
                <h2 className="text-xl font-semibold mb-3">新しいルームを作成</h2>
                <button 
                    onClick={handleCreateRoom}
                    className="w-full py-2 bg-cyan-600 hover:bg-cyan-500 transition duration-150 rounded-md font-bold shadow-md"
                    disabled={!socket || !socket.connected}
                >
                    ルームを作成
                </button>
                {!socket?.connected && (
                    <p className="text-sm text-yellow-500 mt-2 text-center">サーバー接続中...</p>
                )}
            </div>

            {/* --- 既存のルームに参加 (ID入力) --- */}
            <div className="mb-6 p-4 bg-gray-800 rounded-lg border border-gray-700">
                <h2 className="text-xl font-semibold mb-3">IDで参加</h2>
                <input
                    type="text"
                    placeholder="ルームIDを入力 (例: abcde1)"
                    value={roomIdInput}
                    onChange={(e) => setRoomIdInput(e.target.value)}
                    className="w-full px-3 py-2 mb-3 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400"
                />
                <button 
                    onClick={() => handleJoinRoom(roomIdInput)}
                    className="w-full py-2 bg-green-600 hover:bg-green-500 transition duration-150 rounded-md font-bold shadow-md"
                    disabled={!roomIdInput.trim()}
                >
                    ルームに参加
                </button>
            </div>

            {/* --- 既存ルーム一覧 --- */}
            <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
                <h2 className="text-xl font-semibold mb-3 text-cyan-400">公開ルーム一覧</h2>
                
                {isLoading ? (
                    <p className="text-gray-400 text-center">ルームリストを読み込み中...</p>
                ) : rooms.length === 0 ? (
                    <p className="text-gray-400 text-center">現在、公開されているルームはありません。</p>
                ) : (
                    <ul className="space-y-3">
                        {rooms.map((room) => (
                            <li 
                                key={room.id} 
                                className={`flex justify-between items-center p-3 rounded-md shadow-md transition duration-150 cursor-pointer ${room.playerCount >= room.maxPlayers ? 'bg-red-900 opacity-50' : 'bg-gray-700 hover:bg-gray-600'}`}
                                onClick={() => room.playerCount < room.maxPlayers && handleJoinRoom(room.id)}
                            >
                                <div>
                                    <p className="text-lg font-medium">{room.name}</p>
                                    <p className="text-sm text-gray-400">ID: {room.id}</p>
                                </div>
                                <div className="text-right">
                                    <span className={`text-sm font-bold ${room.playerCount < room.maxPlayers ? 'text-green-400' : 'text-red-400'}`}>
                                        {room.playerCount}/{room.maxPlayers}
                                    </span>
                                    <p className="text-xs text-gray-500">
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
