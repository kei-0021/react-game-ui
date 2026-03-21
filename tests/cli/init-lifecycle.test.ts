// tests/cli/init-lifecycle.ts
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

const TEST_ROOT = path.join(process.cwd(), 'tests/tmp-init');
const REGISTRY_RELATIVE_PATH = 'constants/games.ts';

describe('CLI: プロジェクト初期化 (init) のテスト', () => {
  beforeAll(() => {
    // テスト実行前にクリーンな状態にする
    if (fs.existsSync(TEST_ROOT)) {
      fs.rmSync(TEST_ROOT, { recursive: true, force: true });
    }
    fs.mkdirSync(TEST_ROOT, { recursive: true });
  });

  afterAll(() => {
    // テスト終了後の後片付け
    if (fs.existsSync(TEST_ROOT)) {
      fs.rmSync(TEST_ROOT, { recursive: true, force: true });
    }
  });

  it('init: 実行後に必要なディレクトリ構造がすべて作成されること', () => {
    // RG_UI_BASE_DIR を指定して init を実行
    execSync(`RG_UI_BASE_DIR=${TEST_ROOT} npx tsx src/cli/init.ts`);

    const expectedDirs = [
      '', // TEST_ROOT 自体
      'rooms',
      'server',
      'constants',
    ];

    expectedDirs.forEach((dir) => {
      const p = path.join(TEST_ROOT, dir);
      expect(fs.existsSync(p)).toBe(true);
      expect(fs.lstatSync(p).isDirectory()).toBe(true);
    });
  });

  it('init: レジストリファイル (games.ts) が初期状態で生成されること', () => {
    const registryPath = path.join(TEST_ROOT, REGISTRY_RELATIVE_PATH);

    expect(fs.existsSync(registryPath)).toBe(true);

    const content = fs.readFileSync(registryPath, 'utf-8');

    expect(content).toContain('export interface GameEntry');
    expect(content).toContain('export const GAME_LIST: GameEntry[] = [');
    expect(content).toContain('{ id: "sample", name: "Sample", icon: "⬛️" }');
  });
});
