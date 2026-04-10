// src/types/piece.ts

import type { PieceId } from './definition.js';

// コマのデータ型
export type PieceData = {
  id: PieceId;
  name: string;
  color: string;
  image?: string;
  location: {
    row: number;
    col: number;
  };
};
