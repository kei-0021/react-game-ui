// main.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { DeepAbyssRoom } from './rooms/DeepAbyssRoom.js';
import { LobbyRoom } from './rooms/LobbyRoom.js';
import { SampleRoom } from './rooms/SampleRoom.js';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        {/* ルートパス (/) をロビーに設定 */}
        <Route path="/" element={<LobbyRoom />} />

        <Route path="/game/sample/:roomId" element={<SampleRoom />} />
        <Route path="/game/deepabyss/:roomId" element={<DeepAbyssRoom />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
);
