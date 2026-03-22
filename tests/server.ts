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
      room: false,
      deck: false,
      draggable: false,
    },
  };

  const gameServer = new GameServer(options);
  gameServer.start();

  const configDir = path.resolve(__dirname, 'server');
  chokidar.watch(configDir).on('change', async (filePath) => {
    await new Promise((resolve) => setTimeout(resolve, 200));

    try {
      const fileName = path.basename(filePath);
      // Data か Config どちらの変更でも gameId を抽出 (例: sampleData -> sample)
      const gameIdMatch = fileName.match(/^(.+?)(Config|Data)\.ts$/);
      if (!gameIdMatch) return;

      const gameId = gameIdMatch[1];
      // 常に Config ファイルのパスを生成
      const configPath = path.join(configDir, `${gameId}Config.ts`);

      // キャッシュを避けて Config を読み込み
      const fileUrl = `file://${configPath}?update=${Date.now()}`;
      const module = await import(fileUrl);

      const newConfig = Object.values(module).find(
        (val: any) =>
          val && typeof val.setup === 'function' && (val.gameId === gameId || val.gameId === gameId.toLowerCase()),
      ) as any;

      if (newConfig && allLoadedData.has(gameId)) {
        console.log(`[Watcher] 🍴 ${gameId} を再セットアップ中... (${fileName} の変更)`);

        const targetData = allLoadedData.get(gameId);
        const updatedParam = await newConfig.setup(targetData);

        gameServer.updateGameParam(gameId, updatedParam);
        // メモリ上の gameParams も同期しておく
        gameParams[gameId] = updatedParam;

        console.log(`[Watcher] ✅ ${gameId} のホットスワップに成功しました`);
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
