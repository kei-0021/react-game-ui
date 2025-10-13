// src/types/piece.ts

import { PieceId } from "./definition.js";

// コマのデータ型
export type PieceData = {
  id: PieceId;
  name: string;
  color: string;
  // コマが現在いるマス目の論理的な位置
  location: {
    row: number;
    col: number;
  };
};