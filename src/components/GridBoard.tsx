// src/components/GridBoard.tsx

import type { DragEvent } from 'react';
import * as React from 'react';
import type { PieceData } from '../types/piece.js';

import styles from './Board.module.css';
import { Cell, CellData } from './Cell.js';
import Piece from './Piece.js';

// 💡 修正点 1: グリッドの位置情報型を定義（Locationの代わりにGridLocationを使用）
type GridLocation = {
  row: number;
  col: number;
}

// 💡 修正点 2: GridBoardPropsのイベントハンドラの引数を GridLocation に統一
type GridBoardProps = {
  rows: number;
  cols: number;
  boardData: CellData[][];
  pieces: PieceData[]; 
  changedCells: GridLocation[];
  
  allowPieceDrag?: boolean;
  
  renderCell: (cellData: CellData, row: number, col: number) => React.ReactNode;
  
  // イベントハンドラの引数を cellData と Location オブジェクトに統一
  onCellClick: (cellData: CellData, loc: GridLocation) => void;
  onCellDoubleClick: (cellData: CellData, loc: GridLocation) => void; 

  onPieceClick: (pieceId: string) => void;

  onPieceDragStart: (e: DragEvent<HTMLDivElement>, piece: PieceData) => void;
  // onCellDrop は row/col を個別で受け取る方が外部ライブラリとの連携で便利なため維持
  onCellDrop: (e: React.DragEvent<HTMLDivElement>, row: number, col: number) => void; 
};

export default function GridBoard({ 
    rows, 
    cols, 
    boardData, 
    pieces, 
    changedCells, 
    renderCell, 
    onCellClick,
    onCellDoubleClick, 
    onPieceClick, 
    allowPieceDrag = false, 
    onPieceDragStart,
    onCellDrop
}: GridBoardProps) {
  
  // 💡 修正点 3: イベントハンドラを GridLocation オブジェクトで受け取るように変更
  const handleCellClick = (loc: GridLocation) => {
    const data = boardData[loc.row][loc.col];
    onCellClick(data, loc);
  };
  
  const handleCellDoubleClick = (loc: GridLocation) => {
    const data = boardData[loc.row][loc.col];
    onCellDoubleClick(data, loc);
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
          
          const isChanged = changedCells.some(
            loc => loc.row === row && loc.col === col
          );
          
          const effectiveContent = isChanged 
            ? originalCellData.changedContent
            : originalCellData.content;
            
          const cellDataForRenderer: CellData = { 
            ...originalCellData, 
            content: effectiveContent 
          };
          
          // 💡 修正点 4: Location オブジェクトを生成
          const loc: GridLocation = { row, col };

          return (
            // 💡 修正点 5: Cell にジェネリクス型 (GridLocation) を適用
            <Cell<GridLocation> 
              key={originalCellData.id}
              // 💡 修正点 6: Props名を 'locationData' に変更し、loc オブジェクトを渡す
              locationData={loc} 
              cellData={cellDataForRenderer} 
              // 💡 修正点 7: イベントハンドラは関数そのものを渡す (Cell側でlocを引数に実行される)
              onClick={handleCellClick} 
              onDoubleClick={handleCellDoubleClick}
              
              onDrop={(e) => onCellDrop(e, row, col)}
              onDragOver={(e) => e.preventDefault()}
              changed={isChanged}
            >
              {renderCell(cellDataForRenderer, row, col)}
            </Cell>
          );
        })
      ))}

      {/* 2. コマのレンダリング (変更なし) */}
      {pieces.map(piece => {
        // ... (コマのロジックは変更なし)
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