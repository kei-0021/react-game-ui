// src/types/piece.ts

import { PieceId } from './definition.js';

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
