// tests/cli/game-lifecycle.test.ts
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

const TEST_GAME = 'TestGame';
const TEST_ROOT = path.join(process.cwd(), 'tests/tmp');
const REGISTRY_RELATIVE_PATH = 'constants/games.ts';

describe('CLI: ゲーム生成と削除のライフサイクルテスト', () => {
  beforeAll(() => {
    // テスト実行前の環境構築
    if (fs.existsSync(TEST_ROOT)) fs.rmSync(TEST_ROOT, { recursive: true });

    fs.mkdirSync(path.join(TEST_ROOT, 'constants'), { recursive: true });
    fs.mkdirSync(path.join(TEST_ROOT, 'rooms'), { recursive: true });
    fs.mkdirSync(path.join(TEST_ROOT, 'server'), { recursive: true });

    fs.writeFileSync(path.join(TEST_ROOT, REGISTRY_RELATIVE_PATH), 'export const games = [];');
  });

  afterAll(() => {
    // temp ファイルの削除
    if (fs.existsSync(TEST_ROOT)) fs.rmSync(TEST_ROOT, { recursive: true });
  });

  it('generate: 指定したディレクトリに必要なファイル群が生成されること', () => {
    execSync(`RG_UI_BASE_DIR=${TEST_ROOT} npx tsx src/cli/generate-new-game.ts ${TEST_GAME}`);

    const expectedFiles = [
      `server/${TEST_GAME}Config.ts`,
      `rooms/${TEST_GAME}Room.tsx`,
      `rooms/${TEST_GAME}Room.module.css`,
      REGISTRY_RELATIVE_PATH,
    ];

    expectedFiles.forEach((file) => {
      const p = path.join(TEST_ROOT, file);
      expect(fs.existsSync(p)).toBe(true);
    });
  });

  it('generate: レジストリファイルに新しいゲームIDが追記されること', () => {
    const registry = fs.readFileSync(path.join(TEST_ROOT, REGISTRY_RELATIVE_PATH), 'utf-8');
    expect(registry).toContain(`id: "${TEST_GAME.toLowerCase()}"`);
  });

  it('delete: 実行後に生成されたファイルが削除され、レジストリからも消えること', () => {
    execSync(`RG_UI_BASE_DIR=${TEST_ROOT} npx tsx src/cli/delete-game.ts ${TEST_GAME}`);

    // ファイルの削除確認
    expect(fs.existsSync(path.join(TEST_ROOT, `rooms/${TEST_GAME}Room.tsx`))).toBe(false);

    // レジストリからの削除確認
    const registry = fs.readFileSync(path.join(TEST_ROOT, REGISTRY_RELATIVE_PATH), 'utf-8');
    expect(registry).not.toContain(`id: "${TEST_GAME.toLowerCase()}"`);
  });
});
