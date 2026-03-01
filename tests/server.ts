// tests/server.ts
import path from 'path';
import type { RoomParam } from 'react-game-ui';
import { GameServer, type GameServerOptions } from 'react-game-ui/server';
import {
  chunkTo2D,
  Config,
  generateFromTemplates,
  loadJsonAssert,
  replicateData,
  SetupTools,
  Validators,
} from 'react-game-ui/server-io-utils';
import { fileURLToPath } from 'url';
import { customEvents } from './data/customEvents.js';
import { deepAbyssConfig } from './server/deepAbyssConfig.js';
import { sampleConfig } from './server/sampleConfig.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * 各Configのsetupに渡すためのツール群
 * 内部の古い関数から、ライブラリ標準の関数へ差し替え
 */
const setupTools: SetupTools = {
  assertCards: (data: any): any[] => {
    if (Validators.isCardArray(data)) return data;
    throw new Error('Invalid card data');
  },
  createUniqueCards: replicateData,
  createBoardLayout: (base: any[], counts: Record<string, number>, cols: number) =>
    chunkTo2D(generateFromTemplates(base, counts), cols),

  createTokenStore: (_id: string, _name: string, templates: any[], count: number): any[] => {
    return replicateData(templates, count);
  },
};

async function startServer() {
  const gamePresets: Record<string, RoomParam> = {};
  const configs: Config[] = [sampleConfig, deepAbyssConfig];

  for (const config of configs) {
    const loadedData: Record<string, any> = {};

    for (const [key, relPath] of Object.entries(config.dataFiles)) {
      const finalPath = path.resolve(__dirname, relPath as string);
      loadedData[key] = await loadJsonAssert(finalPath, (data): data is any => true);
    }

    // ツール群を渡してプリセットを生成
    gamePresets[config.gameId] = await config.setup(loadedData, setupTools);
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
