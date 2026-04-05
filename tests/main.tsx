// main.js
import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { LobbyRoom } from './rooms/LobbyRoom.js';

/**
 * roomsディレクトリ内のファイルから動的にルートを生成する
 */
function getAutoRoutes() {
  // eager: true で全モジュールを同期的に取得
  const roomModules = import.meta.glob('./rooms/*Room.tsx', { eager: true });

  const routes = [];

  for (const [path, module] of Object.entries(roomModules)) {
    try {
      // ロビー自体は除外
      if (path.includes('LobbyRoom')) continue;

      // 削除直後などでモジュールが空、またはアクセス不能な場合はスキップ
      if (!module || Object.keys(module as object).length === 0) continue;

      const fileName = path.split('/').pop()?.replace('.tsx', '') || '';
      const routePath = fileName.replace(/Room$/, '').toLowerCase();

      // コンポーネントの抽出（名前付き、デフォルト、あるいは最初に見つかった関数）
      const RoomComponent =
        (module as any)[fileName] ||
        (module as any).default ||
        Object.values(module as any).find((val) => typeof val === 'function');

      if (RoomComponent) {
        routes.push({
          path: `/${routePath}/:roomId`,
          Component: RoomComponent,
          key: fileName,
        });
      }
    } catch (err) {
      // ファイル消失による ENOENT 等の例外をここで食い止める
      console.warn(`[Vite] ルート構築中にスキップされたパス: ${path}`);
    }
  }

  return routes;
}

function App() {
  const [routes, setRoutes] = useState(getAutoRoutes());

  useEffect(() => {
    if (import.meta.hot) {
      // ディレクトリではなく、自分自身を指定する
      // rooms 内のファイルが消えたり増えたりすると、このコールバックが叩かれる
      import.meta.hot.accept((newModule) => {
        if (newModule) {
          console.log('[HMR] ファイル構成の変更を検知。ルートを再構成します。');
          setRoutes(getAutoRoutes());
        }
      });
    }
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LobbyRoom />} />
        {routes.map(({ path, Component, key }) => (
          <Route key={key} path={path} element={<Component />} />
        ))}
        {/* 削除されたページに居座った時用のフォールバック（任意） */}
        <Route path="*" element={<LobbyRoom />} />
      </Routes>
    </BrowserRouter>
  );
}

const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
}
