// src/components/Board.tsx (最終版 - content/changedContentロジック修正済み)

import type { DragEvent } from 'react';
import * as React from 'react';
import type { PieceData } from '../types/piece.js';

import styles from './Board.module.css';
import Cell from './Cell.js';
import Piece from './Piece.js';

// マス目の基本データ型（Cell.tsxと統一）
export type CellData = {
  id: string;
  shapeType: string;
  backgroundColor: string;
  changedColor: string;
  
  content: string;        
  changedContent: string; 
  
  customClip?: string;
  [key: string]: any; 
};

// 座標の型
type Location = {
    row: number;
    col: number;
};

type BoardProps = {
  rows: number;
  cols: number;
  boardData: CellData[][];
  pieces: PieceData[]; 
  changedCells: Location[];
  
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
    changedCells, 
    renderCell, 
    onCellClick, 
    onPieceClick, 
    allowPieceDrag = false, 
    onPieceDragStart,
    onCellDrop
}: BoardProps) {
  
  const handleCellClick = (row: number, col: number) => {
    // クリックハンドラーは元のCellDataを参照
    const data = boardData[row][col];
    onCellClick(data, row, col);
  };
  
  const handlePieceDragStart = (e: DragEvent<HTMLDivElement>, piece: PieceData) => {
      onPieceDragStart(e, piece);
  };

  const boardStyle: React.CSSProperties = {
    '--board-rows': rows,
    '--board-cols': cols,
    display: 'grid',
    gridTemplateRows: `repeat(${rows}, 1fr)`, 
    gridTemplateColumns: `repeat(${cols}, 1fr)`,
    gap: '4px',
    width: '600px', 
    height: '600px', 
    position: 'relative',
  } as React.CSSProperties;

  return (
    <div className={styles.boardContainer} style={boardStyle}>
      {/* 1. マス目のレンダリング */}
      {boardData.map((rowArr, row) => (
        rowArr.map((originalCellData, col) => {
          
          // ⭐ [探索済み状態の判定]
          const isChanged = changedCells.some(
            loc => loc.row === row && loc.col === col
          );
          
          // ⭐ 修正ロジック: 探索状態に応じて content を切り替える
          // changedContent (探索後) vs content (探索前)
          const effectiveContent = isChanged 
            ? originalCellData.changedContent    // 探索済み: changedContent (例: '⚠️')を表示
            : originalCellData.content;           // 未探索: content (例: "")を表示
            
          // ⭐ Cellとレンダラーに渡す、加工された CellData オブジェクト
          const cellDataForRenderer: CellData = { 
            ...originalCellData, 
            // ⭐ content プロパティに有効なコンテンツを設定
            content: effectiveContent 
            // changedContent はそのまま保持
          };

          return (
            <Cell
              key={originalCellData.id}
              row={row}
              col={col}
              // ⭐ 加工された CellData を渡す
              cellData={cellDataForRenderer} 
              onClick={handleCellClick}
              onDrop={(e) => onCellDrop(e, row, col)}
              onDragOver={(e) => e.preventDefault()}
              changed={isChanged} // ⭐ Cellに探索済み状態を渡す
            >
              {/* ⭐ レンダラーも加工されたデータを参照する */}
              {renderCell(cellDataForRenderer, row, col)}
            </Cell>
          );
        })
      ))}

      {/* 2. コマのレンダリング (変更なし) */}
      {pieces.map(piece => {
        const sameLocationPieces = pieces.filter(
            p => p.location.row === piece.location.row && p.location.col === piece.location.col
        );
        const groupIndex = sameLocationPieces.findIndex(p => p.id === piece.id);
        const groupCount = sameLocationPieces.length;

        let offsetX = 0;
        let offsetY = 0;
        
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
            onDragStart={(e) => handlePieceDragStart(e, piece)}
          />
        );
      })}
    </div>
  );
}