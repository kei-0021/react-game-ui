// src/components/GridBoard.tsx
import { CellData, Player } from '@/index.js';
import { BoardId, PieceId, PlayerId, RoomId } from '@/types/definition.js';
import {
  BaordMovePieceData,
  BoardMovableRangeData,
  BoardUpdateData,
  TokenMoveFromBoardData,
} from '@/types/socketData.js';
import type { DragEvent } from 'react';
import * as React from 'react';
import { Socket } from 'socket.io-client';
import type { PieceData } from '../types/piece.js';
import styles from './Board.module.css';
import { Cell } from './Cell.js';
import { Piece } from './Piece.js';

type GridLocation = {
  row: number;
  col: number;
};

type GridBoardProps = {
  socket: Socket;
  roomId: RoomId;
  boardId: BoardId;
  players?: Player[];
  myPlayerId: PlayerId | null;
  allowPieceDrag?: boolean;
  moveRange?: number;
  isExact?: boolean;
  width?: number;
  height?: number;
  renderCell: (cellData: CellData, row: number, col: number) => React.ReactNode;
};

/**
 * 盤面（グリッド）を表示し、セルや駒のインタラクション、ドラッグ＆ドロップを管理する
 * @param {Socket} socket - Socket.ioのインスタンス
 * @param {RoomId} roomId - 現在のルームID
 * @param {string} boardId - 描画対象となる盤面の識別子
 * @param {Player[]} players - ルームに参加しているプレイヤーのリスト。指定するとプレーヤーに対応するコマを生成する
 * @param {PlayerId} myPlayerId - 操作者自身のプレイヤーID
 * @param {boolean} [allowPieceDrag=false] - 駒のドラッグ操作を許可するかどうか
 * @param {boolean} [moveRange=2] - 駒が移動できるマス数
 * @param {boolean} [isExact=true] - 駒が移動できるマス数がピッタリであるべきかのフラグ
 * @param {number} widht - 横幅
 * @param {number} height - 縦幅
 * @param {(cellData: CellData, row: number, col: number) => React.ReactNode} renderCell - 各マスの内部コンテンツを描画する関数
 */
export function GridBoard({
  socket,
  roomId,
  boardId,
  players,
  myPlayerId,
  allowPieceDrag = false,
  moveRange = 2,
  isExact = true,
  width = 800,
  height = 800,
  renderCell,
}: GridBoardProps) {
  const [isBoardReady, setIsBoardReady] = React.useState(false);
  const [cells, setCells] = React.useState<CellData[]>([]);
  const [changedCells, setChangedCells] = React.useState<GridLocation[]>([]);
  const [highlightedCells, setHighlightedCells] = React.useState<GridLocation[]>([]);
  const [draggingPieceId, setDraggingPieceId] = React.useState<PieceId | null>(null);

  // serverExtraPiecesが「盤上のすべての駒（自分・他・敵）」を持つ前提にする
  const [pieces, setPieces] = React.useState<PieceData[]>([]);
  const [serverExtraPieces, setServerExtraPieces] = React.useState<PieceData[]>([]);

  // IDから盤面の最大行列数を計算（一次元配列対応）
  const rows = cells.length > 0 ? Math.max(...cells.map((c) => parseInt(c.id.match(/r(\d+)/)?.[1] || '0', 10))) + 1 : 0;
  const cols = cells.length > 0 ? Math.max(...cells.map((c) => parseInt(c.id.match(/c(\d+)/)?.[1] || '0', 10))) + 1 : 0;

  const handleCellClick = (celldata: CellData, loc: GridLocation) => {
    console.log('クリックされました');
  };

  const handleCellDoubleClick = (celldata: CellData, loc: GridLocation) => {
    if (!isBoardReady || !socket) return;
    console.log('ダブルクリックされました');
  };

  const handleCellDrop = (e: DragEvent<HTMLDivElement>, targetRow: number, targetCol: number) => {
    e.preventDefault();
    if (!isBoardReady || !socket) return;

    const draggedPieceId = e.dataTransfer.getData('pieceId');
    if (draggedPieceId) {
      // ドロップ（移動確定）したらハイライトを消す
      setHighlightedCells([]);

      socket.emit('board:move-piece', {
        roomId,
        boardId: boardId,
        pieceId: draggedPieceId,
        newLocation: { row: targetRow, col: targetCol },
      } as BaordMovePieceData);
    }
  };

  /**
   * 駒クリック時のハンドラ
   * 移動可能範囲を表示するためにサーバーへリクエストを飛ばす
   */
  const requestMovableRange = (pieceId: PieceId) => {
    if (!isBoardReady || !socket) return;

    const targetPiece = pieces.find((p) => p.id === pieceId);
    if (!targetPiece) return;

    // 持ち主（ownerId）が設定されている場合、自分以外ならリクエストを送らない
    if (targetPiece.ownerId && targetPiece.ownerId !== myPlayerId) return;

    const requestData: BoardMovableRangeData = {
      roomId,
      boardId,
      playerId: pieceId,
      moveRange: moveRange,
      isExact: isExact,
    };

    socket.emit('board:movable-range', requestData);
  };

  const handlePieceDragStart = (e: DragEvent<HTMLDivElement>, piece: PieceData) => {
    // ドラッグ権限チェック
    if (piece.ownerId && piece.ownerId !== myPlayerId) {
      e.preventDefault();
      return;
    }

    e.dataTransfer.setData('pieceId', piece.id);
    e.dataTransfer.effectAllowed = 'move';
    setDraggingPieceId(piece.id);
    requestMovableRange(piece.id);
  };

  const handlePieceDragEnd = () => {
    setDraggingPieceId(null);
  };

  /**
   * トークンをダブルクリックした際のハンドラ
   * 盤面から取り除き、手札等のサーバー管理領域に戻すリクエストを送信
   */
  const handleTokenDoubleClick = (pieceId: PieceId) => {
    if (!isBoardReady || !socket) return;

    const targetToken = pieces.find((p) => p.id === pieceId);
    if (!targetToken) return;

    if (targetToken.ownerId && targetToken.ownerId !== myPlayerId) return;

    const requestData: TokenMoveFromBoardData = {
      roomId,
      boardId,
      tokenId: pieceId,
    };

    socket.emit('token:move-from-board', requestData);
  };

  // ------------------- Socket Effects -------------------

  // 盤面初期化/更新
  React.useEffect(() => {
    const handleInitBoard = (data: BoardUpdateData) => {
      if (data.board && data.board.length > 0) {
        setCells(data.board);
        setIsBoardReady(true);
      }
      if (data.extraPieces) {
        setServerExtraPieces(data.extraPieces);
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
    // playersからmapするのではなく、サーバーから来た駒リストをそのままセット
    const safePieces = Array.isArray(serverExtraPieces) ? serverExtraPieces : [];
    setPieces(safePieces);
  }, [serverExtraPieces]);

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
          pieces.find((p) => p.id === draggingPieceId)?.movableCells?.some((loc) => loc.row === r && loc.col === c) ??
          false;

        const cellDataForRenderer: CellData = {
          ...cell,
          content: isChanged ? cell.changedContent : cell.content,
        };

        const loc: GridLocation = { row: r, col: c };

        return (
          <Cell<GridLocation>
            key={cell.id}
            locationData={{ row: r, col: c }}
            cellData={cellDataForRenderer}
            onClick={() => handleCellClick(cell, { row: r, col: c })}
            onDoubleClick={() => handleCellDoubleClick(cell, loc)}
            onDrop={(e) => handleCellDrop(e, r, c)}
            onDragOver={(e) => e.preventDefault()}
            highlighted={isHighlighted && !!draggingPieceId}
            changed={isChanged}
          >
            {renderCell(cellDataForRenderer, r, c)}
          </Cell>
        );
      })}

      {/* コマのレンダリング */}
      {pieces.map((piece) => {
        const pos = (piece as any).position;
        if (!pos) return null;

        const sameLocationPieces = pieces.filter((p) => {
          const pPos = (p as any).position;
          return pPos && pPos.row === pos.row && pPos.col === pos.col;
        });

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
          // 確定した座標 pos を使用
          gridArea: `${pos.row + 1} / ${pos.col + 1} / span 1 / span 1`,
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
            onClick={requestMovableRange}
            onDoubleClick={() => handleTokenDoubleClick(piece.id)}
            isDraggable={allowPieceDrag}
            isFilled={true}
            onDragStart={handlePieceDragStart}
            onDragEnd={handlePieceDragEnd}
          />
        );
      })}
    </div>
  );
}
