// src/types/token.ts

import { TokenId } from './definition.js';

/**
 * トークンのデータ構造
 * @property {TokenId} id - 一意な識別子
 * @property {string} name - トークン名
 * @property {string} [imageSrc] - トークンの画像URL（省略時は名前を表示）
 * @property {string} [color] - トークンの背景用のカラーコード
 * @property {string} [description] - トークンの説明文
 */
export type Token = {
  id: TokenId;
  name: string;
  imageSrc?: string;
  color?: string;
  description?: string;
};
