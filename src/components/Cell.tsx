import * as React from 'react';
import styles from './Board.module.css';

// 座標の型
type Location = {
    row: number;
    col: number;
};

type CellProps = {
  row: number;
  col: number;
  cellData: {
    backgroundColor: string;
    // ⭐ 変更後の色を受け取る
    changedColor: string; 
    // ... その他のデータ
  };
  
  // ⭐ [修正点 1] onDoubleClick を CellProps に追加
  onClick: (row: number, col: number) => void;
  onDoubleClick: (row: number, col: number) => void; 
  
  children: React.ReactNode;
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  changed: boolean; 
};

export default function Cell({ 
  row, 
  col, 
  cellData, 
  onClick, 
  onDoubleClick, // ⭐ [修正点 2] propsとして受け取る
  children, 
  onDrop, 
  onDragOver, 
  changed = false
}: CellProps) {
  
  const handleClick = () => {
    onClick(row, col); 
  };
  
  // ⭐ [修正点 3] ダブルクリック用の内部ハンドラを追加
  const handleDoubleClick = () => {
    onDoubleClick(row, col);
  };

  // 1. 背景色の決定ロジックを修正
  // changed が true なら cellData.changedColor を使用
  const effectiveBackgroundColor = changed 
    ? cellData.changedColor 
    : cellData.backgroundColor;

  const cellStyle: React.CSSProperties = {
    backgroundColor: effectiveBackgroundColor,
    // (clipPathなどの他のスタイルもここに追加できます)
  };
  
  return (
    <div 
      className={styles.cell} 
      onClick={handleClick}
      onDoubleClick={handleDoubleClick} // ⭐ [修正点 4] DOM要素に適用
      onDrop={onDrop}
      onDragOver={onDragOver}
      style={cellStyle}
    >
      {children}
    </div>
  );
}