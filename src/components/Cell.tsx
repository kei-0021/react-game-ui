import * as React from 'react';
import styles from './Board.module.css';

type CellProps = {
  row: number;
  col: number;
  cellData: any; // セル固有のデータ (形状情報などを含む)
  onClick: (row: number, col: number) => void;
  children: React.ReactNode; // マス目のレンダリング結果（形状）を受け取る
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
};

export default function Cell({ row, col, cellData, onClick, children, onDrop, onDragOver }: CellProps) {
  const handleClick = () => {
    onClick(row, col);
  };

  return (
    <div 
      className={styles.cell} 
      onClick={handleClick}
      onDrop={onDrop}
      onDragOver={onDragOver}
    >
      {children}
    </div>
  );
}