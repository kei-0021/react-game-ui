// tests/server.ts
import path from 'path';
import type { RoomParam } from 'react-game-ui';
import { GameServer, type GameServerOptions } from 'react-game-ui/server';
import { loadJsonAssert, RoomConfig } from 'react-game-ui/server-io-utils';
import { fileURLToPath } from 'url';
import { customEvents } from './data/customEvents.js';
import { deepAbyssConfig } from './server/deepAbyssConfig.js';
import { sampleConfig } from './server/sampleConfig.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const gamePresets: Record<string, RoomParam> = {};
  const configs: RoomConfig[] = [sampleConfig, deepAbyssConfig];

  // プリセットを生成
  for (const config of configs) {
    const loadedData: Record<string, any> = {};

    for (const [key, relPath] of Object.entries(config.dataFiles)) {
      const finalPath = path.resolve(__dirname, relPath as string);
      loadedData[key] = await loadJsonAssert(finalPath, (data): data is any => true);
    }

    gamePresets[config.gameId] = await config.setup(loadedData);
  }

  // サーバーオプションの設定
  const options: GameServerOptions = {
    port: 4000,
    clientDistPath: path.resolve(__dirname, '..', 'dist'),
    libDistPath: path.resolve('../dist'),
    corsOrigins: ['http://localhost:5173', 'http://localhost:4000'],
    gamePresets: gamePresets,
    customEvents,
    initialLogCategories: {
      connection: true,
      deck: true,
      room: true,
      lobby: true,
    },
    onServerStart: (url: string) => console.log(`🎮 Demo server running at: ${url}`),
  };

  const demoServer = new GameServer(options);
  demoServer.start();
}

startServer().catch((err) => {
  console.error('致命的なエラー: サーバー起動に失敗しました。', err);
  process.exit(1);
});
