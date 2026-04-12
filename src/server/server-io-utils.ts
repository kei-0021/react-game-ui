// src/server/server-io-utils.ts

import { CellData, DraggableData, GameParam } from '@/index.js';
import { Coordinate } from '@/types/coodinate.js';
import { GameId } from '@/types/definition.js';
import { TokenData } from '@/types/token.js';
import fs from 'node:fs';
import { CardData } from '../types/card.js';
import { Resource } from '../types/resource.js';

export type RoomConfig = {
  gameId: GameId;
  dataFiles: Record<string, any>;
  setup: (loadedData: Record<string, any>) => Promise<GameParam>;
};

// --- 型バリデーター関数群 ---
export const Validators = {
  isCardArray: (data: CardData[]): data is CardData[] => {
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
 * 同じカードやトークンの数を増やすのに使用する
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
 * プリセット準備の関数群
 */
export class SetupHelper {
  /**
   * カードデータのバリデーション
   */
  assertCards(data: any): CardData[] {
    if (Validators.isCardArray(data)) return data;
    throw new Error('Invalid card data');
  }

  /**
   * カードに共通のプロパティ（location, drawConditionなど）をセットする
   */
  initializeCards(cards: any[], defaults: Partial<CardData>): CardData[] {
    return cards.map((card) => ({
      ...card,
      ...defaults,
    }));
  }

  /**
   * カードの複製（ユニーク化）
   */
  createUniqueCards(cards: CardData[], numSets: number): CardData[] {
    return replicateData(cards, numSets);
  }

  /**
   * トークンストアの生成。共通情報の初期化も可能。
   * @param tokens - 入力トークンデータ
   * @param count - トークン置き場に置くトークンの数
   * @param imageSrc - トークンの画像URL（省略可能）
   * @param color - トークンの背景用のカラーコード（省略可能）
   * @returns トークン置き場
   */
  createTokenStore(tokens: TokenData[], count: number, imageSrc?: string, color?: string): TokenData[] {
    const replicatedTokens = replicateData(tokens, count);
    if (imageSrc) {
      replicatedTokens.forEach((token) => {
        token.image = imageSrc;
      });
    }
    if (color) {
      replicatedTokens.forEach((token) => {
        token.color = color;
      });
    }
    return replicatedTokens;
  }

  /**
   * グリッド状ボードレイアウトの生成
   */
  createGridBoardLayout(base: any[], counts: Record<string, number>, rows: number, cols?: number): CellData[] {
    const effectiveCols = cols ?? rows;
    const expectedTotal = rows * effectiveCols;
    const actualTotal = Object.values(counts).reduce((sum, count) => sum + count, 0);

    if (actualTotal !== expectedTotal) {
      throw new Error(`[Grid Error] Size:${rows}x${effectiveCols}(${expectedTotal}) != Total:${actualTotal}`);
    }

    let templates = generateFromTemplates(base, counts);

    // セルを配置して基本データを作る
    const grid: CellData[] = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < effectiveCols; c++) {
        const template = templates[r * effectiveCols + c];
        grid.push({
          ...template,
          id: `r${r}c${c}`,
          adjacentCellIds: [],
        });
      }
    }

    // 隣接セルIDを計算して流し込む
    grid.forEach((cell) => {
      const match = cell.id.match(/r(\d+)c(\d+)/);
      if (!match) return;
      const r = parseInt(match[1], 10);
      const c = parseInt(match[2], 10);

      const adjacents: string[] = [];
      // 上下左右の相対座標
      const directions = [
        { dr: -1, dc: 0 }, // 上
        { dr: 1, dc: 0 }, // 下
        { dr: 0, dc: -1 }, // 左
        { dr: 0, dc: 1 }, // 右
      ];

      directions.forEach(({ dr, dc }) => {
        const nr = r + dr;
        const nc = c + dc;
        // 盤面内かチェック
        if (nr >= 0 && nr < rows && nc >= 0 && nc < effectiveCols) {
          adjacents.push(`r${nr}c${nc}`);
        }
      });

      cell.adjacentCellIds = adjacents;
    });

    return grid;
  }

  /**
   * ドラッグ可能オブジェクトの生成
   */
  createDraggable(
    id: string,
    coordinate: Coordinate = { x: 500, y: 500 },
    zIndex: number = 0,
    rotation: number = 0,
  ): DraggableData {
    return { id, coordinate, zIndex, rotation };
  }
}
