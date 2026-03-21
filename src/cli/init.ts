#!/usr/bin/env node
// src/cli/init.ts
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const init = () => {
  const cwd = process.cwd();
  // delete-game.ts と同様に、環境変数があればそれをベースにする
  const baseDir = process.env.RG_UI_BASE_DIR || path.join(cwd, 'src');

  console.log(`🚀 Initializing rg-ui project in: ${baseDir}`);

  // 必要なディレクトリ構造の定義
  const dirs = [baseDir, path.join(baseDir, 'rooms'), path.join(baseDir, 'server'), path.join(baseDir, 'constants')];

  dirs.forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`Created directory: ${path.relative(cwd, dir)}`);
    }
  });

  // 最小限必要な基盤ファイルの定義
  const files = {
    registry: {
      path: path.join(baseDir, 'constants', 'games.ts'),
      content: `// rg-ui auto-generated game registry\nexport const games = [];\n`,
    },
    // 将来的にはここに server.ts や main.tsx のテンプレートも追加
  };

  // ファイルの生成（既存の場合は上書きしない安全策）
  Object.entries(files).forEach(([name, info]) => {
    if (!fs.existsSync(info.path)) {
      fs.writeFileSync(info.path, info.content);
      console.log(`Initialized: ${path.relative(cwd, info.path)}`);
    } else {
      console.warn(`Skipped: ${path.basename(info.path)} (already exists)`);
    }
  });

  console.log('\n✨ Project initialization complete!');
  console.log('Next step: pnpm rg-ui gen <GameName>');
};

// 直接実行時の処理
const __filename = fileURLToPath(import.meta.url);
if (process.argv[1] && (process.argv[1].endsWith('init.js') || process.argv[1].endsWith('init.ts'))) {
  init();
}
