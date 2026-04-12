// src/types/token.ts

import type { TokenId } from './definition.js';
import { Position } from './position.js';

/**
 * トークンのデータ構造
 * @property {TokenId} id - 一意な識別子
 * @property {string} name - トークン名
 * @property {string} [image] - トークンの画像URL（省略時は名前を表示）
 * @property {string} [color] - トークンの背景用のカラーコード
 * @property {string} [description] - トークンの説明文
 * @property {Position | null} - 盤面上の位置
 * @property {any[]} - 盤面上で移動可能なマスの一覧
 */
export type TokenData = {
  id: TokenId;
  name: string;
  image?: string;
  color?: string;
  description?: string;
  position: Position | null;
  movableCells: any[];
};
