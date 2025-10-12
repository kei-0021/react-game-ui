import * as React from 'react';
import styles from './Board.module.css';

type CellProps = {
  row: number;
  col: number;
  cellData: {
    backgroundColor: string;
    // ⭐ 変更後の色を受け取る
    changedColor: string; 
    // ... その他のデータ
  };
  onClick: (row: number, col: number) => void;
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
  children, 
  onDrop, 
  onDragOver, 
  changed = false
}: CellProps) {
  
  const handleClick = () => {
    onClick(row, col); 
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
      onDrop={onDrop}
      onDragOver={onDragOver}
      style={cellStyle}
    >
      {children}
    </div>
  );
}