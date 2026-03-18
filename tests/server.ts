// tests/server.ts
import chokidar from 'chokidar';
import path from 'path';
import { fileURLToPath } from 'url';
import type { GameParam } from '../src/index.js';
import { loadJsonAssert, RoomConfig } from '../src/server/server-io-utils.js';
import { GameServer, GameServerOptions } from '../src/server/server.js';
import { customEvents } from './data/customEvents.js';
import { deepAbyssConfig } from './server/deepAbyssConfig.js';
import { sampleConfig } from './server/sampleConfig.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const allLoadedData = new Map<string, any>();
  const gameParams: Record<string, GameParam> = {};
  const configs: RoomConfig[] = [sampleConfig, deepAbyssConfig];

  // プリセットを生成
  for (const config of configs) {
    const loadedData: Record<string, any> = {};

    for (const [key, relPath] of Object.entries(config.dataFiles)) {
      const finalPath = path.resolve(__dirname, relPath as string);
      loadedData[key] = await loadJsonAssert(finalPath, (data): data is any => true);
    }

    allLoadedData.set(config.gameId, loadedData);
    gameParams[config.gameId] = await config.setup(loadedData);
  }

  // サーバーオプションの設定
  const options: GameServerOptions = {
    port: 4000,
    clientDistPath: path.resolve(__dirname, '..', 'dist'),
    libDistPath: path.resolve('../dist'),
    corsOrigins: ['http://localhost:5173', 'http://localhost:4000'],
    gameParams: gameParams,
    customEvents,
    initialLogCategories: {
      connection: true,
      lobby: true,
      room: true,
      deck: false,
    },
  };

  const gameServer = new GameServer(options);
  gameServer.start();

  const configDir = path.resolve(__dirname, 'server');
  chokidar.watch(configDir).on('change', async (filePath) => {
    try {
      const fileUrl = `file://${filePath}?update=${Date.now()}`;
      const module = await import(fileUrl);

      // 設定ファイルから config を取得
      const newConfig = Object.values(module).find(
        (val: any) => val && typeof val.setup === 'function' && val.gameId,
      ) as any;

      if (newConfig && allLoadedData.has(newConfig.gameId)) {
        console.log(`[Watcher] 🍴 ${newConfig.gameId} を再セットアップ中...`);

        // 保存しておいた「正しい材料」を取り出して渡す
        const targetData = allLoadedData.get(newConfig.gameId);
        const updatedParam = await newConfig.setup(targetData);

        gameServer.updateGameParam(newConfig.gameId, updatedParam);
        console.log(`[Watcher] ✅ ${newConfig.gameId} のホットスワップに成功しました`);
      }
    } catch (err) {
      console.error('[Watcher] ❌ 再読み込み失敗:', err);
    }
  });
}

startServer().catch((err) => {
  console.error('致命的なエラー: サーバー起動に失敗しました。', err);
  process.exit(1);
});
