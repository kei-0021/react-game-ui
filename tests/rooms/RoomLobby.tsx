// src/components/RoomLobby.tsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function RoomLobby() {
  const [roomId, setRoomId] = useState("");
  const navigate = useNavigate();

  // 既存のルームに参加する
  const handleJoinRoom = () => {
    if (roomId.trim()) {
      // 入力されたIDのゲームルームへ遷移
      navigate(`/room/${roomId.trim()}`);
    } else {
      alert("ルームIDを入力してください。");
    }
  };

  // 新しいルームを作成する（ランダムIDを生成）
  const handleCreateRoom = () => {
    // 実際には、サーバー側で一意なIDを生成することが推奨されますが、
    // クライアント側でランダムなIDを生成する例です。
    const newRoomId = Math.random().toString(36).substring(2, 8); // 例: 6桁の英数字
    console.log(`新しいルームを作成: ${newRoomId}`);
    
    // 新しく作成したIDのゲームルームへ遷移
    navigate(`/room/${newRoomId}`);
  };

  return (
    <div style={{ padding: "20px", maxWidth: "400px", margin: "0 auto" }}>
      <h1>🎲 ゲームロビー 🤝</h1>
      <p>遊びたいルームに参加するか、新しいルームを作成してください。</p>

      {/* --- ルームに参加 --- */}
      <div style={{ marginBottom: "20px", border: "1px solid #ccc", padding: "15px", borderRadius: "8px" }}>
        <h2>既存のルームに参加</h2>
        <input
          type="text"
          placeholder="ルームIDを入力 (例: abcde1)"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
          style={{ width: "100%", padding: "10px", margin: "10px 0", boxSizing: "border-box" }}
        />
        <button 
          onClick={handleJoinRoom}
          style={{ padding: "10px 20px", width: "100%", backgroundColor: "#4CAF50", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}
        >
          ルームに参加
        </button>
      </div>
      
      {/* --- ルームを作成 --- */}
      <div style={{ border: "1px solid #ccc", padding: "15px", borderRadius: "8px" }}>
        <h2>新しいルームを作成</h2>
        <button 
          onClick={handleCreateRoom}
          style={{ padding: "10px 20px", width: "100%", backgroundColor: "#008CBA", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}
        >
          新しいルームを作成
        </button>
      </div>

      {/* 既存ルームの一覧表示などもここに追加できます */}
    </div>
  );
}