// src/components/GridBoard.tsx
import { PieceId } from '@/types/definition.js';
import type { DragEvent } from 'react';
import * as React from 'react';
import type { PieceData } from '../types/piece.js';
import styles from './Board.module.css';
import { Cell, CellData } from './Cell.js';
import { Piece } from './Piece.js';

type GridLocation = {
  row: number;
  col: number;
};

type GridBoardProps = {
  rows: number;
  cols: number;
  cellData: CellData[];
  pieces: PieceData[];
  highlightedCells: GridLocation[];
  changedCells: GridLocation[];
  allowPieceDrag?: boolean;
  renderCell: (cellData: CellData, row: number, col: number) => React.ReactNode;
  onCellClick: (cellData: CellData, loc: GridLocation) => void;
  onCellDoubleClick: (cellData: CellData, loc: GridLocation) => void;
  onPieceClick: (pieceId: PieceId) => void;
  onPieceDragStart: (e: DragEvent<HTMLDivElement>, piece: PieceData) => void;
  onPieceDrop: (e: React.DragEvent<HTMLDivElement>, row: number, col: number) => void;
  width?: number;
  height?: number;
};

/**
 * 盤面（グリッド）を表示し、セルや駒のインタラクション、ドラッグ＆ドロップを管理する
 * @param {number} rows - 盤面の行数
 * @param {number} cols - 盤面の列数
 * @param {CellData[]} cellData - 各セルの状態を持つ2次元配列
 * @param {PieceData[]} pieces - 盤面上に配置される駒（Piece）のデータ
 * @param {GridLocation[]} highlightendCells - ハイライトを適用する座標のリスト
 * @param {GridLocation[]} changedCells - 状態変化を適用する座標のリスト
 * @param {boolean} [allowPieceDrag=false] - 駒のドラッグ操作を許可するかどうか
 * @param {(cellData: CellData, row: number, col: number) => React.ReactNode} renderCell - 各マスの内部コンテンツを描画する関数
 * @param {(cellData: CellData, loc: GridLocation) => void} onCellClick - セルがクリックされた時の処理
 * @param {(cellData: CellData, loc: GridLocation) => void} onCellDoubleClick - セルがダブルクリックされた時の処理
 * @param {(pieceId: string) => void} onPieceClick - 駒がクリックされた時の処理
 * @param {(e: DragEvent<HTMLDivElement>, piece: PieceData) => void} onPieceDragStart - 駒のドラッグが開始された時の処理
 * @param {(e: React.DragEvent<HTMLDivElement>, row: number, col: number) => void} onPieceDrop - セルに駒がドロップされた時の処理
 * @param {number} widht - 横幅
 * @param {number} height - 縦幅
 */
export function GridBoard({
  rows,
  cols,
  cellData,
  pieces,
  highlightedCells,
  changedCells,
  renderCell,
  onCellClick,
  onCellDoubleClick,
  onPieceClick,
  allowPieceDrag = false,
  onPieceDragStart,
  onPieceDrop,
  width = 800,
  height = 800,
}: GridBoardProps) {
  const handleCellClick = (cell: CellData, loc: GridLocation) => {
    onCellClick(cell, loc);
  };

  const handleCellDoubleClick = (cell: CellData, loc: GridLocation) => {
    onCellDoubleClick(cell, loc);
  };

  const boardStyle: React.CSSProperties = {
    '--board-rows': rows,
    '--board-cols': cols,
    display: 'grid',
    gridTemplateRows: `repeat(${rows}, 1fr)`,
    gridTemplateColumns: `repeat(${cols}, 1fr)`,
    gap: '4px',
    width: width,
    height: height,
    position: 'relative',
  } as React.CSSProperties;

  return (
    <div className={styles.boardContainer} style={boardStyle}>
      {/* マス目のレンダリング */}
      {cellData.map((cell) => {
        const match = cell.id.match(/r(\d+)c(\d+)/);
        const r = match ? parseInt(match[1], 10) : 0;
        const c = match ? parseInt(match[2], 10) : 0;

        const isChanged = changedCells.some((loc) => loc.row === r && loc.col === c);
        const isHighlighted = highlightedCells.some((loc) => loc.row === r && loc.col === c);

        const cellDataForRenderer: CellData = {
          ...cell,
          content: isChanged ? cell.changedContent : cell.content,
        };

        const loc: GridLocation = { row: r, col: c };

        return (
          <Cell<GridLocation>
            key={cell.id}
            locationData={loc}
            cellData={cellDataForRenderer}
            onClick={() => handleCellClick(cell, loc)}
            onDoubleClick={() => handleCellDoubleClick(cell, loc)}
            onDrop={(e) => onPieceDrop(e, r, c)}
            onDragOver={(e) => e.preventDefault()}
            highlighted={isHighlighted}
            changed={isChanged}
          >
            {renderCell(cellDataForRenderer, r, c)}
          </Cell>
        );
      })}

      {/* コマのレンダリング */}
      {pieces.map((piece) => {
        const sameLocationPieces = pieces.filter(
          (p) => p.location.row === piece.location.row && p.location.col === piece.location.col,
        );
        const groupIndex = sameLocationPieces.findIndex((p) => p.id === piece.id);
        const groupCount = sameLocationPieces.length;

        let offsetX = 0;
        let offsetY = 0;

        if (groupCount > 1) {
          const radius = 18;
          const angle = ((2 * Math.PI) / groupCount) * groupIndex;
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
            onDragStart={(e) => onPieceDragStart(e, piece)}
          />
        );
      })}
    </div>
  );
}
