import * as React from 'react';
import type { PieceData } from '../types/piece.js';
import styles from './Piece.module.css';

// 🚀 [修正] DragEventの型をインポート
import type { DragEvent } from 'react';

export type PieceProps = {
  piece: PieceData;
  style: React.CSSProperties; 
  onClick: (pieceId: string) => void;
  isDraggable: boolean;
  // ⭐ [修正] onDragStartの型を、Reactの標準的な DragEvent を受け取るように変更
  // Board.tsxと型を統一するため、ここでは DragEvent<HTMLDivElement> と PieceData を引数にします
  onDragStart: (e: DragEvent<HTMLDivElement>, piece: PieceData) => void;
};

// 戻り値の型も明示
export default function Piece({ piece, style, onClick, isDraggable, onDragStart }: PieceProps): JSX.Element {
  
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick(piece.id);
  };
  
  // ⭐ [修正] 標準の onDragStart イベントハンドラ
  const handleDragStart = (e: DragEvent<HTMLDivElement>) => {
    if (isDraggable) {
      e.stopPropagation();
      
      // 必須: ドラッグが開始されたときに、ドラッグするデータをセットする
      e.dataTransfer.setData('text/plain', piece.id); 
      e.dataTransfer.effectAllowed = 'move';
      
      // 親（Board.tsx）から渡されたハンドラを実行
      onDragStart(e, piece); 
    }
  };

  const pieceClasses = [
      styles.piece,
      isDraggable ? styles.draggable : styles.clickable 
  ].join(' ');

  return (
    <div 
      className={pieceClasses}
      style={{ 
        ...style, 
        backgroundColor: piece.color,
      }}
      onClick={handleClick}
      // ⭐ [追加] HTMLの draggable 属性を設定
      draggable={isDraggable} 
      // ⭐ [修正] 標準の onDragStart イベントハンドラを設定
      onDragStart={handleDragStart} 
      // 🚨 onMouseDown/onTouchStart のカスタムドラッグ処理は削除。
      //    draggable="true"とonDragStartで十分です。
      title={piece.name}
    >
      {/* コマの中に表示する文字やアイコン */}
      {piece.name.substring(0, 1)}
    </div>
  );
}