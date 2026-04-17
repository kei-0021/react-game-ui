// src/types/token.ts

import type { PlayerId, TokenId, TokenStoreId } from './definition.js';
import { Position } from './position.js';

/**
 * トークンのデータ構造
 * @property {TokenId} id - 一意な識別子
 * @property {TokenStoreId} tokenStoreId - トークン置き場ID
 * @property {string} name - トークン名
 * @property {PlayerId | null} - 現在このトークンを保持しているプレイヤーID
 * @property {string} [image] - トークンの画像URL（省略時は名前を表示）
 * @property {string} [color] - トークンの背景用のカラーコード
 * @property {string} [description] - トークンの説明文
 * @property {Position | null} - 盤面上の位置
 * @property {Position[]} - 盤面上で移動可能なマスの一覧
 */
export type TokenData = {
  id: TokenId;
  tokenStoreId: TokenStoreId;
  name: string;
  ownerId: PlayerId | null;
  image?: string;
  color?: string;
  description?: string;
  position: Position | null;
  movableCells: Position[];
};
