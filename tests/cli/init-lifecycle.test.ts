// tests/cli/init-lifecycle.ts
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

const TEST_ROOT = path.join(process.cwd(), 'tests/tmp-init');

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
    ];

    expectedDirs.forEach((dir) => {
      const p = path.join(TEST_ROOT, dir);
      expect(fs.existsSync(p)).toBe(true);
      expect(fs.lstatSync(p).isDirectory()).toBe(true);
    });
  });
});
