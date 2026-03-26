#!/usr/bin/env node
// src/cli/delete-game.ts
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const remove = (rawName: string) => {
  if (!rawName) {
    console.error('削除するゲーム名を指定してください');
    process.exit(1);
  }

  // 生成時と同じロジックで英数字のみ抽出
  const gameName = rawName.replace(/[^\w]/g, '');
  const pascalName = gameName.charAt(0).toUpperCase() + gameName.slice(1);

  // 環境変数があればそれをベースにし、なければ通常の 'src' を起点にする
  const baseDir = process.env.RG_UI_BASE_DIR || path.join(process.cwd(), 'src');

  const paths = {
    data: path.join(baseDir, 'server', `${pascalName}Data.ts`),
    config: path.join(baseDir, 'server', `${pascalName}Config.ts`),
    room: path.join(baseDir, 'rooms', `${pascalName}Room.tsx`),
    style: path.join(baseDir, 'rooms', `${pascalName}Room.module.css`),
  };

  // ファイルの削除
  [paths.data, paths.config, paths.room, paths.style].forEach((filePath) => {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`Deleted: ${path.basename(filePath)}`);
    } else {
      console.warn(`Not found: ${path.basename(filePath)}`);
    }
  });

  console.log(`Cleanup complete: ${gameName}`);
};

// 直接実行時の処理
const __filename = fileURLToPath(import.meta.url);
if (process.argv[1] && (process.argv[1].endsWith('delete-game.js') || process.argv[1].endsWith('delete-game.ts'))) {
  // 直接実行時は argv[2] が名前になる
  remove(process.argv[2]);
}
