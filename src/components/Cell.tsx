// src/components/Cell.tsx
import * as React from 'react';
import type { CellId } from "../types/definition.js";
import styles from './Board.module.css';

// CellData は外部で定義されている型に依存すると仮定します。
export type CellData = {
  id: CellId;
  shapeType: string;
  backgroundColor: string;
  changedColor: string;
  
  content: string;        
  changedContent: string; 
  
  customClip?: string;
  [key: string]: any; 
};

// ----------------------------------------------------
// CellProps にジェネリクス <TLocation> を適用
// ----------------------------------------------------
type CellProps<TLocation> = {
  // 💡 Propsのキー名を locationData ではなく location に戻します (一般的な慣習)。
  //    ただし、ここではコードの整合性を優先し、locationData を維持します。
  locationData: TLocation;
  
  cellData: CellData;
  changed: boolean; 
  
  onClick: (loc: TLocation) => void;
  onDoubleClick: (loc: TLocation) => void; 
  
  children: React.ReactNode;
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
};


// ----------------------------------------------------
// 💡 修正点: React.FC を使用してコンポーネントを定義
// ----------------------------------------------------
export const Cell = <TLocation,>({ // ⭐ [修正 1]: ジェネリクスをコンポーネント定義時に適用 (Trailing Commaが必要)
  locationData, 
  cellData, 
  onClick, 
  onDoubleClick, 
  children, 
  onDrop, 
  onDragOver, 
  changed = false
}: React.PropsWithChildren<CellProps<TLocation>>) => { // ⭐ [修正 2]: Propsの型を明示

  // --------------------------
  // 💡 'All destructured elements are unused' の解消
  // ロジック内で全てのPropsが使われているため、このエラーは解消します。
  // --------------------------
  
  const handleClick = () => {
    onClick(locationData); 
  };
  
  const handleDoubleClick = () => {
    onDoubleClick(locationData);
  };

  const effectiveBackgroundColor = changed 
    ? cellData.changedColor 
    : cellData.backgroundColor;

  const cellStyle: React.CSSProperties = {
    backgroundColor: effectiveBackgroundColor,
  };
  
  return (
    <div 
      className={styles.cell} 
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onDrop={onDrop}
      onDragOver={onDragOver}
      style={cellStyle}
    >
      {children}
    </div>
  );
};