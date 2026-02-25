// src/server/server-io-utils.ts

import fs from 'node:fs';
import { Card } from '../types/card.js';
import { Resource } from '../types/resource.js';

// --- 型バリデーター関数群 ---
export const Validators = {
  isCardArray: (data: any): data is Card[] =>
    Array.isArray(data) &&
    data.every((item) => {
      // 最低限の必須項目チェック（これがないとCardとして成立しない）
      if (!('id' in item) || !('name' in item)) return false;

      // 「もし存在するなら」型が一致しているか全項目チェック
      const checks = [
        item.deckId === undefined || typeof item.deckId === 'string',
        item.description === undefined || typeof item.description === 'string',
        item.location === undefined || typeof item.location === 'string',
        item.isFaceUp === undefined || typeof item.isFaceUp === 'boolean',
        item.backColor === undefined || typeof item.backColor === 'string',
        item.drawCondition === undefined || (Array.isArray(item.drawCondition) && item.drawCondition.length === 2),
      ];

      return checks.every(Boolean);
    }),

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

/**
 * 指定した枚数分、IDをユニークにしながらデータを複製する
 * デッキのセット数を増やしたい時に便利
 */
export const replicateData = <T extends { id: string }>(data: T[], numSets: number): T[] => {
  return Array.from({ length: numSets }).flatMap((_, i) =>
    data.map((item) => ({ ...item, id: `${item.id}-s${i + 1}` })),
  );
};

/**
 * テンプレート配列と個数設定から、フラットな配置用配列を作る
 */
export const generateFromTemplates = <T extends { templateId: string }>(
  templates: T[],
  counts: Record<string, number>,
): T[] => {
  const templateMap = templates.reduce(
    (map, t) => {
      map[t.templateId] = t;
      return map;
    },
    {} as Record<string, T>,
  );

  return Object.entries(counts).flatMap(([templateId, count]) => {
    const template = templateMap[templateId];
    if (!template) return [];
    return Array.from({ length: count }, (_, i) => ({
      ...template,
      id: `${templateId}-${i + 1}`,
    }));
  });
};

/**
 * 1次元配列を2次元（ボード形式）に変換する
 */
export const chunkTo2D = <T>(array: T[], cols: number): T[][] => {
  const rows: T[][] = [];
  for (let i = 0; i < array.length; i += cols) {
    rows.push(array.slice(i, i + cols));
  }
  return rows;
};
