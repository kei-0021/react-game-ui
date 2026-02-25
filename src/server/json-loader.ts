import fs from 'node:fs';
import { Card } from '../types/card.js';
import { Resource } from '../types/resource.js';

// --- 型バリデーター関数群 ---
export const Validators = {
  isCardArray: (data: any): data is Card[] =>
    Array.isArray(data) && data.every((item) => 'id' in item && 'name' in item),

  isResourceArray: (data: any): data is Resource[] =>
    Array.isArray(data) && data.every((item) => 'resourceId' in item && 'currentValue' in item),

  isCellArray: (data: any): data is any[] => Array.isArray(data) && data.every((item) => 'templateId' in item),
};

/**
 * 内部でバリデーションまで完結させる JSON ローダー
 */
export function loadJsonAssert<T>(relativePath: string, validator: (data: any) => data is T): T {
  if (!fs.existsSync(relativePath)) {
    throw new Error(`[File Not Found] 読み込み失敗: ${relativePath}`);
  }

  const raw = fs.readFileSync(relativePath, 'utf-8');
  const parsed = JSON.parse(raw);

  if (!validator(parsed)) {
    throw new Error(`[Type Mismatch] JSONの構造が一致しません: ${relativePath}`);
  }

  return parsed;
}
