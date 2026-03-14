// src/components/GridBoard.tsx
import { Player } from '@/index.js';
import { BoardId, PieceId, PlayerId, RoomId } from '@/types/definition.js';
import { BaordMovePlayerData, BoardMovableRangeData, BoardUpdateData } from '@/types/socketData.js';
import type { DragEvent } from 'react';
import * as React from 'react';
import { Socket } from 'socket.io-client';
import type { PieceData } from '../types/piece.js';
import styles from './Board.module.css';
import { Cell, CellData } from './Cell.js';
import { Piece } from './Piece.js';

const moveRange = 2;

type GridLocation = {
  row: number;
  col: number;
};

type GridBoardProps = {
  socket: Socket;
  roomId: RoomId;
  boardId: BoardId;
  players: Player[];
  myPlayerId: PlayerId | null;
  allowPieceDrag?: boolean;
  renderCell: (cellData: CellData, row: number, col: number) => React.ReactNode;
  width?: number;
  height?: number;
};

/**
 * 盤面（グリッド）を表示し、セルや駒のインタラクション、ドラッグ＆ドロップを管理する
 * @param {Socket} socket - Socket.ioのインスタンス
 * @param {RoomId} roomId - 現在のルームID
 * @param {string} boardId - 描画対象となる盤面の識別子
 * @param {Player[]} players - ルームに参加しているプレイヤーのリスト
 * @param {PlayerId} myPlayerId - 操作者自身のプレイヤーID
 * @param {boolean} [allowPieceDrag=false] - 駒のドラッグ操作を許可するかどうか
 * @param {(cellData: CellData, row: number, col: number) => React.ReactNode} renderCell - 各マスの内部コンテンツを描画する関数
 * @param {number} widht - 横幅
 * @param {number} height - 縦幅
 */
export function GridBoard({
  socket,
  roomId,
  boardId,
  players,
  myPlayerId,
  renderCell,
  allowPieceDrag = false,
  width = 800,
  height = 800,
}: GridBoardProps) {
  const [isBoardReady, setIsBoardReady] = React.useState(false);
  const [cells, setCells] = React.useState<CellData[]>([]);
  const [changedCells, setChangedCells] = React.useState<GridLocation[]>([]);
  const [highlightedCells, setHighlightedCells] = React.useState<GridLocation[]>([]);
  const [draggingPieceId, setDraggingPieceId] = React.useState<PieceId | null>(null);
  const [pieces, setPieces] = React.useState<PieceData[]>([]);

  // IDから盤面の最大行列数を計算（一次元配列対応）
  const rows = cells.length > 0 ? Math.max(...cells.map((c) => parseInt(c.id.match(/r(\d+)/)?.[1] || '0', 10))) + 1 : 0;
  const cols = cells.length > 0 ? Math.max(...cells.map((c) => parseInt(c.id.match(/c(\d+)/)?.[1] || '0', 10))) + 1 : 0;

  const handleCellClick = (celldata: CellData, loc: GridLocation) => {
    if (!isBoardReady || !socket || !myPlayerId) return;

    socket.emit('game:explore-cell', {
      playerId: myPlayerId,
      targetPosition: loc,
      roomId,
      shouldExplore: true,
    });
  };

  const handleCellDoubleClick = (celldata: CellData, loc: GridLocation) => {
    if (!isBoardReady || !socket) return;
    socket.emit('game:explore-cell', { targetPosition: loc, roomId, shouldExplore: false });
  };

  const handleCellDrop = (e: DragEvent<HTMLDivElement>, targetRow: number, targetCol: number) => {
    e.preventDefault();
    if (!isBoardReady || !socket) return;

    const draggedPieceId = e.dataTransfer.getData('pieceId');
    if (draggedPieceId) {
      // ドロップ（移動確定）したらハイライトを消す
      setHighlightedCells([]);

      socket.emit('board:move-player', {
        roomId,
        boardId: boardId,
        playerId: draggedPieceId,
        newLocation: { row: targetRow, col: targetCol },
      } as BaordMovePlayerData);
    }
  };

  /**
   * 駒クリック時のハンドラ
   * 移動可能範囲を表示するためにサーバーへリクエストを飛ばす
   */
  const handlePieceClick = (pieceId: PieceId) => {
    if (!isBoardReady || !socket || pieceId !== myPlayerId) return;

    socket.emit('board:movable-range', {
      roomId,
      boardId,
      playerId: pieceId,
      moveRange: moveRange,
    } as BoardMovableRangeData);
  };

  const handlePieceDragStart = (e: DragEvent<HTMLDivElement>, piece: PieceData) => {
    e.dataTransfer.setData('pieceId', piece.id);
    e.dataTransfer.effectAllowed = 'move';
    setDraggingPieceId(piece.id);
    handlePieceClick(piece.id);
  };

  const handlePieceDragEnd = () => {
    setDraggingPieceId(null);
  };

  // ------------------- Socket Effects -------------------

  // 盤面初期化/更新
  React.useEffect(() => {
    const handleInitBoard = (data: BoardUpdateData) => {
      if (data.board && data.board.length > 0) {
        setCells(data.board);
        setIsBoardReady(true);
      }
    };
    socket.on('board:update', handleInitBoard);
    return () => {
      socket.off('board:update', handleInitBoard);
    };
  }, [socket]);

  // ハイライト（移動範囲など）の更新
  React.useEffect(() => {
    const handleCellUpdate = (updatedLocs: GridLocation[]) => {
      // サーバーから空配列が来たらハイライト解除、座標が来たら上書き
      setChangedCells(updatedLocs);
    };
    socket.on('cell:update', handleCellUpdate);
    return () => {
      socket.off('cell:update', handleCellUpdate);
    };
  }, [socket]);

  // プレイヤー情報を描画用の駒データに変換
  React.useEffect(() => {
    setPieces((prevPieces) => {
      return players.map((p) => {
        const existingPiece = prevPieces.find((piece) => piece.id === p.id);
        const location: GridLocation = p.position;

        const playerColor = p.color || existingPiece?.color || '#aaaaaa';
        const playerName = p.name || existingPiece?.name || `P?`;

        return {
          ...existingPiece,
          id: p.id,
          name: playerName,
          color: playerColor,
          location,
        } as PieceData;
      });
    });
  }, [players]);

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

  if (!isBoardReady) {
    return (
      <div
        style={{
          padding: '40px',
          textAlign: 'center',
          fontSize: '20px',
          color: '#e0e0e0',
        }}
      >
        <p>サーバーから盤面データをロード中...</p>
      </div>
    );
  }

  return (
    <div className={styles.boardContainer} style={boardStyle}>
      {/* マス目のレンダリング */}
      {cells.map((cell) => {
        const match = cell.id.match(/r(\d+)c(\d+)/);
        const r = match ? parseInt(match[1], 10) : 0;
        const c = match ? parseInt(match[2], 10) : 0;

        const isChanged = changedCells.some((loc) => loc.row === r && loc.col === c);
        const isHighlighted =
          players.find((p) => p.id === draggingPieceId)?.movableCells?.some((loc) => loc.row === r && loc.col === c) ??
          false;

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
            onDrop={(e) => handleCellDrop(e, r, c)}
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
            onClick={handlePieceClick}
            isDraggable={allowPieceDrag}
            onDragStart={handlePieceDragStart}
            onDragEnd={handlePieceDragEnd}
          />
        );
      })}
    </div>
  );
}
