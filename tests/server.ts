import chokidar from 'chokidar';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import type { GameParam } from '../src/index.js';
import { loadJsonAssert, RoomConfig } from '../src/server/server-io-utils.js';
import { GameServer, GameServerOptions } from '../src/server/server.js';
import { customEvents } from './data/customEvents.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const allLoadedData = new Map<string, any>();
  const gameParams: Record<string, GameParam> = {};
  const isProduction = process.env.NODE_ENV === 'production';
  const rootDir = process.cwd();

  const serverDirPath = isProduction ? path.join(rootDir, 'tests', 'server') : path.join(rootDir, 'tests', 'server');

  // ディレクトリ存在チェック
  let files: string[] = [];
  if (fs.existsSync(serverDirPath)) {
    files = fs.readdirSync(serverDirPath);
  } else {
    console.error(`Directory not found: ${serverDirPath}`);
  }

  const configFiles = files.filter((f) => f.endsWith('Config.ts') || f.endsWith('Config.js'));

  for (const file of configFiles) {
    // コンパイル後の .js を読み込むための相対パス
    const modulePath = `./server/${file.replace(/\.ts$/, '.js')}`;
    const module = await import(modulePath);

    const configName = file.replace(/\.(ts|js)$/, '');
    const config: RoomConfig = module[configName] || module.default;

    if (config && config.gameId) {
      console.log(`Config detected: ${configName} (gameId: ${config.gameId})`);

      const loadedData: Record<string, any> = {};

      for (const [key, relPath] of Object.entries(config.dataFiles)) {
        const dataPath = (relPath as string).split('data/')[1];
        const finalPath = path.join(rootDir, 'tests', 'data', dataPath);

        // ファイルの存在を確認してから読み込む
        if (fs.existsSync(finalPath)) {
          loadedData[key] = await loadJsonAssert(finalPath, (_data): _data is any => true);
        } else {
          console.warn(`[Warning] データファイルが見つかりません (スキップ): ${finalPath}`);
          loadedData[key] = {}; // または適切な初期値
        }
      }

      // ツール群を渡してプリセットを生成
      gameParams[config.gameId] = await config.setup(loadedData);

      allLoadedData.set(config.gameId, loadedData);
    }
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
  chokidar.watch(configDir, { ignoreInitial: true }).on('all', async (event, filePath) => {
    if (event !== 'add' && event !== 'change' && event !== 'unlink') return;

    const fileName = path.basename(filePath);
    const gameIdMatch = fileName.match(/^(.+?)(Config|Data)\.ts$/);
    if (!gameIdMatch) return;

    const gameId = gameIdMatch[1];

    // 削除イベントのハンドリング
    if (event === 'unlink') {
      // 既に削除処理中の場合はスキップ
      if (!gameParams[gameId]) return;

      console.log(`[Watcher] 🗑️  ${gameId} の削除を検知しました`);

      // サーバーへ undefined を送り、クライアントのリスト更新を先に走らせる
      gameServer.updateGameParam(gameId, undefined as any);

      // 重要：直後に delete するとブロードキャスト中の参照で落ちるため
      // 処理が一段落した後にメモリを解放する
      setImmediate(() => {
        allLoadedData.delete(gameId);
        delete gameParams[gameId];
        console.log(`[Watcher] ✅ ${gameId} をメモリから解放しました`);
      });

      return;
    }

    // 追加・変更時の安定待ち
    await new Promise((resolve) => setTimeout(resolve, 300));

    try {
      const configPath = path.join(configDir, `${gameId}Config.ts`);

      // 物理ファイルの存在チェック（削除直後のゴーストイベント対策）
      if (!fs.existsSync(configPath)) {
        return;
      }

      const fileUrl = `file://${configPath}?update=${Date.now()}`;
      const module = await import(fileUrl);

      const newConfig = Object.values(module).find(
        (val: any) =>
          val && typeof val.setup === 'function' && (val.gameId === gameId || val.gameId === gameId.toLowerCase()),
      ) as any;

      if (newConfig) {
        if (!allLoadedData.has(gameId)) {
          console.log(`[Watcher] ✨ 新規 Config 検出: ${gameId}`);
          const loadedData: Record<string, any> = {};

          for (const [key, relPath] of Object.entries(newConfig.dataFiles)) {
            const dataPath = (relPath as string).split('data/')[1];
            const finalPath = path.join(rootDir, 'tests', 'data', dataPath);

            if (fs.existsSync(finalPath)) {
              loadedData[key] = await loadJsonAssert(finalPath, (_data): _data is any => true);
            }
          }
          allLoadedData.set(gameId, loadedData);
        }

        console.log(`[Watcher] 🍴 ${gameId} をセットアップ中... (${event})`);

        const targetData = allLoadedData.get(gameId);
        const updatedParam = await newConfig.setup(targetData);

        gameParams[gameId] = updatedParam;
        gameServer.updateGameParam(gameId, updatedParam);

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
