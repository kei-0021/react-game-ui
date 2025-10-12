import * as React from 'react';
import type { PieceData } from '../types/piece.js';

// **【注意】** ReactのDragEventの型をインポートします
import type { DragEvent } from 'react';

import styles from './Board.module.css';
import Cell from './Cell.js';
import Piece from './Piece.js';

// マス目の基本データ型
export type CellData = {
  id: string;
  // ... その他のゲーム固有データ
  shapeType: string; // 例: 'square', 'circle', 'custom-polygon'など
  backgroundColor: string;
  // ユーザーが定義したい無限のカスタムプロパティ
  [key: string]: any; 
};

type BoardProps = {
  rows: number;
  cols: number;
  boardData: CellData[][]; // ボードの状態を二次元配列で受け取る
  pieces: PieceData[]; 
  
  allowPieceDrag?: boolean;
  
  renderCell: (cellData: CellData, row: number, col: number) => React.ReactNode;
  
  onCellClick: (cellData: CellData, row: number, col: number) => void;
  onPieceClick: (pieceId: string) => void;

  onPieceDragStart: (e: DragEvent<HTMLDivElement>, piece: PieceData) => void;
  onCellDrop: (e: React.DragEvent<HTMLDivElement>, row: number, col: number) => void; 
};

export default function Board({ 
    rows, 
    cols, 
    boardData, 
    pieces, 
    renderCell, 
    onCellClick, 
    onPieceClick, 
    allowPieceDrag = false, 
    // ⭐⭐⭐ [修正1: onPieceDragStartをpropsから受け取る]
    onPieceDragStart,
    onCellDrop
}: BoardProps) {
  
  const handleCellClick = (row: number, col: number) => {
    const data = boardData[row][col];
    onCellClick(data, row, col);
  };
  
  // ⭐⭐⭐ [追加] Pieceコンポーネントに渡すonDragStartハンドラ
  // Pieceコンポーネントは pieceData と イベント を受け取る想定
  const handlePieceDragStart = (e: DragEvent<HTMLDivElement>, piece: PieceData) => {
      // 外部で定義されたロジックを実行
      onPieceDragStart(e, piece);
  };

  const boardStyle: React.CSSProperties = {
    '--board-rows': rows,
    '--board-cols': cols,
    display: 'grid',
    gridTemplateRows: `repeat(${rows}, 1fr)`, 
    gridTemplateColumns: `repeat(${cols}, 1fr)`,
    gap: '4px',
    width: '600px', // 例
    height: '600px', // 例
    position: 'relative', // コマの絶対配置のために追加
  } as React.CSSProperties;

  return (
    <div className={styles.boardContainer} style={boardStyle}>
      {/* 1. マス目のレンダリング (変更なし) */}
      {boardData.map((rowArr, row) => (
        rowArr.map((cellData, col) => (
          <Cell
            key={cellData.id}
            row={row}
            col={col}
            cellData={cellData}
            onClick={handleCellClick}
            // ⭐ [追加] ドロップイベントのハンドラを渡す
            onDrop={(e) => onCellDrop(e, row, col)}
            // ⭐ [追加] onDragOver も必須 (これを実装しないと onDrop は機能しない)
            onDragOver={(e) => e.preventDefault()} 
          >
            {/* renderCell プロップを使用して、外部で定義されたカスタム形状を挿入 */}
            {renderCell(cellData, row, col)}
          </Cell>
        ))
      ))}

      {/* 2. コマのレンダリング */}
      {pieces.map(piece => {
        // ... (コマのグループ配置ロジックは変更なし) ...
        const sameLocationPieces = pieces.filter(
            p => p.location.row === piece.location.row && p.location.col === piece.location.col
        );
        const groupIndex = sameLocationPieces.findIndex(p => p.id === piece.id);
        const groupCount = sameLocationPieces.length;

        let offsetX = 0;
        let offsetY = 0;
        
        // 複数のコマがある場合、円形にずらして配置する
        if (groupCount > 1) {
            const radius = 18; 
            const angle = (2 * Math.PI / groupCount) * groupIndex;
            offsetX = radius * Math.cos(angle);
            offsetY = radius * Math.sin(angle);
        }

        const pieceStyle: React.CSSProperties = {
          gridArea: `${piece.location.row + 1} / ${piece.location.col + 1} / span 1 / span 1`,
          alignSelf: 'center',
          justifySelf: 'center',
          transform: `translate(${offsetX}px, ${offsetY}px)`,
          transition: 'transform 0.3s ease-in-out',
        };
        
        return (
          <Piece 
            key={piece.id}
            piece={piece}
            style={pieceStyle}
            onClick={onPieceClick}
            isDraggable={allowPieceDrag}
            // onDragStartプロパティを渡す
            onDragStart={(e) => handlePieceDragStart(e, piece)}
          />
        );
      })}
    </div>
  );
}