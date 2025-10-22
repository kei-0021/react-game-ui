// src/types/token.ts

import { TokenId } from "./definition.js";

// トークンの基本データ構造
export type Token = {
  id: TokenId;
  name: string;
  imageSrc: string; // トークン画像へのパス（例: '/assets/gold.png'）
  description?: string;
  color?: string; // 背景色やボーダー色
};