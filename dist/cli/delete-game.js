#!/usr/bin/env node
// src/cli/delete-game.ts
import fs from 'node:fs';
import path from 'node:path';
const rawName = process.argv[3];
if (!rawName) {
    console.error('削除するゲーム名を指定してください');
    process.exit(1);
}
// 生成時と同じロジックで英数字のみ抽出
const gameName = rawName.replace(/[^\w]/g, '');
const lowerName = gameName.toLowerCase();
const pascalName = gameName.charAt(0).toUpperCase() + gameName.slice(1);
// 環境変数があればそれをベースにし、なければ通常の 'src' を起点にする
const baseDir = process.env.RG_UI_BASE_DIR || path.join(process.cwd(), 'src');
const paths = {
    config: path.join(baseDir, 'server', `${pascalName}Config.ts`),
    room: path.join(baseDir, 'rooms', `${gameName}Room.tsx`),
    style: path.join(baseDir, 'rooms', `${gameName}Room.module.css`),
    registry: path.join(baseDir, 'constants/games.ts'),
};
// ファイルの削除
[paths.config, paths.room, paths.style].forEach((filePath) => {
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`Deleted: ${path.basename(filePath)}`);
    }
    else {
        console.warn(`Not found: ${path.basename(filePath)}`);
    }
});
// Registry (games.ts) からの削除
if (fs.existsSync(paths.registry)) {
    const content = fs.readFileSync(paths.registry, 'utf-8');
    const lines = content.split('\n');
    // 指定したIDを含む行を除外
    const filteredLines = lines.filter((line) => !line.includes(`id: "${lowerName}"`));
    if (lines.length !== filteredLines.length) {
        fs.writeFileSync(paths.registry, filteredLines.join('\n'));
        console.log(`Registry entry for "${lowerName}" removed.`);
    }
    else {
        console.warn(`Entry for "${lowerName}" not found in registry.`);
    }
}
console.log(`Cleanup complete: ${gameName}`);
