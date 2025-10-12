// src/types/piece.d.ts

// コマのデータ型
export type PieceData = {
  id: string;
  name: string;
  color: string;
  // コマが現在いるマス目の論理的な位置
  location: {
    row: number;
    col: number;
  };
};