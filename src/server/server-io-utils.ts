// src/server/server-io-utils.ts

import { GameId } from '@/types/definition.js';
import { GameParam } from '@/types/server.js';
import { Token } from '@/types/token.js';
import fs from 'node:fs';
import { Card } from '../types/card.js';
import { Resource } from '../types/resource.js';

// --- 型バリデーター関数群 ---
export const Validators = {
  isCardArray: (data: Card[]): data is Card[] => {
    if (!Array.isArray(data)) throw new Error('Data is not an array');

    return data.every((item, index) => {
      const id = item?.id || `Index:${index}`;

      // 最低限の必須項目チェック
      if (!('id' in item)) throw new Error(`[Card:${id}] 'id' is missing`);
      if (!('name' in item)) throw new Error(`[Card:${id}] 'name' is missing`);

      // 各項目の個別バリデーション
      if (item.deckId !== undefined && typeof item.deckId !== 'string') {
        throw new Error(`[Card:${id}] 'deckId' must be a string`);
      }
      if (item.description !== undefined && typeof item.description !== 'string') {
        throw new Error(`[Card:${id}] 'description' must be a string`);
      }
      if (item.location !== undefined && typeof item.location !== 'string') {
        throw new Error(`[Card:${id}] 'location' must be a string`);
      }
      if (item.isFaceUp !== undefined && typeof item.isFaceUp !== 'boolean') {
        throw new Error(`[Card:${id}] 'isFaceUp' must be a boolean`);
      }
      if (item.backColor !== undefined && typeof item.backColor !== 'string') {
        throw new Error(`[Card:${id}] 'backColor' must be a string`);
      }
      if (item.drawCondition !== undefined) {
        if (!Array.isArray(item.drawCondition)) {
          throw new Error(`[Card:${id}] 'drawCondition' must be an array`);
        }
        if (item.drawCondition.length !== 2) {
          throw new Error(`[Card:${id}] 'drawCondition' must have 2 elements`);
        }
      }

      return true;
    });
  },

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
const replicateData = <T extends { id: string }>(data: T[], numSets: number): T[] => {
  return Array.from({ length: numSets }).flatMap((_, i) =>
    data.map((item) => ({ ...item, id: `${item.id}-s${i + 1}` })),
  );
};

/**
 * テンプレート配列と個数設定から、フラットな配置用配列を作る
 */
const generateFromTemplates = <T extends { templateId: string }>(
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
const chunkTo2D = <T>(array: T[], cols: number): T[][] => {
  const rows: T[][] = [];
  for (let i = 0; i < array.length; i += cols) {
    rows.push(array.slice(i, i + cols));
  }
  return rows;
};

export type RoomConfig = {
  gameId: GameId;
  dataFiles: Record<string, any>;
  setup: (loadedData: Record<string, any>) => Promise<GameParam>;
};

/**
 * プリセット準備の関数群
 */
export class SetupHelper {
  /**
   * カードデータのバリデーション
   */
  assertCards(data: any): Card[] {
    if (Validators.isCardArray(data)) return data;
    throw new Error('Invalid card data');
  }

  /**
   * カードに共通のプロパティ（location, drawConditionなど）をセットする
   */
  initializeCards(cards: any[], defaults: Partial<Card>): Card[] {
    return cards.map((card) => ({
      ...card,
      ...defaults,
    }));
  }

  /**
   * カードの複製（ユニーク化）
   */
  createUniqueCards(cards: Card[], numSets: number): Card[] {
    return replicateData(cards, numSets);
  }

  /**
   * トークンストアの生成
   */
  createTokenStore(tokens: Token[], count: number): Token[] {
    return replicateData(tokens, count);
  }

  /**
   * ボードレイアウトの生成
   */
  createBoardLayout(base: any[], counts: Record<string, number>, cols: number): any[][] {
    return chunkTo2D(generateFromTemplates(base, counts), cols);
  }
}
