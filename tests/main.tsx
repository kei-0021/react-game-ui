import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import GameRoom from "./rooms/GameRoom2.js";
import RoomLobby from "./rooms/RoomLobby.js";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        {/* ルートパス (/) をロビーに設定 */}
        <Route path="/" element={<RoomLobby />} /> 
        
        {/* /room/:roomId にアクセスした時だけゲームルーム（Socket接続を含む）を表示 */}
        <Route path="/room/:roomId" element={<GameRoom />} /> 
        
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
