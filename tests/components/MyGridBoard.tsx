// tests/components/MyBoard.tsx
import * as React from 'react';
import { DragEvent } from 'react';
import { Socket } from 'socket.io-client';
import type { CellData } from '../../src/components/Cell';
import { GridBoard } from '../../src/components/GridBoard';
import type { BoardId, PieceId, PlayerId, RoomId } from '../../src/types/definition';
import type { PieceData } from '../../src/types/piece';
import type { Player } from '../../src/types/player';
import type { BoardUpdateData } from '../../src/types/socketData';

type GridLocation = { row: number; col: number };

type MyGridBoardProps = {
  socket: Socket;
  roomId: RoomId;
  boardId: BoardId;
  myPlayerId: PlayerId | null;
};

const MyCustomCellRenderer = (celldata: CellData, row: number, col: number) => {
  const baseStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    color: '#e0e0e0',
    fontWeight: 'bold',
    fontSize: '26px',
    textAlign: 'center',
    lineHeight: '1.2',
  };

  if (celldata.shapeType === 'circle') {
    return <div style={{ ...baseStyle, borderRadius: '50%' }}>{celldata.content}</div>;
  }

  if (celldata.shapeType === 'custom') {
    return (
      <div
        style={{
          ...baseStyle,
          clipPath: celldata.customClip as string,
          backgroundColor: celldata.backgroundColor === '#ff8a8a' ? '#ff3b3b' : celldata.backgroundColor,
          color: 'white',
        }}
      >
        {celldata.content}
      </div>
    );
  }

  return <div style={{ ...baseStyle, border: '1px solid rgba(255,255,255,0.1)' }}>{celldata.content}</div>;
};

const initialPieces: PieceData[] = [];
const EMPTY_BOARD: CellData[] = [];

/**
 * プレイヤー、駒、盤面セルの状態を管理し、GridBoard をレンダリングするメインビューコンポーネント
 * @param {Socket} socket - サーバーとのリアルタイム通信用ソケットインスタンス
 * @param {string} roomId - 現在参加しているルームの一意識別子
 * @param {string} boardId - 描画対象となる盤面の識別子
 * @param {PlayerId | null} myPlayerId - 操作権限を確認するための自分自身のプレイヤーID
 */
export function MyGridBoard({ socket, roomId, boardId, myPlayerId }: MyGridBoardProps) {
  const [players, setPlayers] = React.useState<Player[]>([]);
  const [pieces, setPieces] = React.useState(initialPieces);
  const [cells, setCells] = React.useState<CellData[]>(EMPTY_BOARD);
  const [isBoardReady, setIsBoardReady] = React.useState(false);
  const [exploredCells, setExploredCells] = React.useState<GridLocation[]>([]);
  const [highlightedCells, setHighlightedCells] = React.useState<GridLocation[]>([]);

  // IDから盤面の最大行列数を計算（一次元配列対応）
  const rows = cells.length > 0 ? Math.max(...cells.map((c) => parseInt(c.id.match(/r(\d+)/)?.[1] || '0', 10))) + 1 : 0;
  const cols = cells.length > 0 ? Math.max(...cells.map((c) => parseInt(c.id.match(/c(\d+)/)?.[1] || '0', 10))) + 1 : 0;

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
    });
  };

  const handleBoardClick = (celldata: CellData, loc: GridLocation) => {
    if (!isBoardReady || !socket || !myPlayerId) return;
    // クリック時にハイライトをクリア（キャンセル動作）
    setHighlightedCells([]);

    socket.emit('game:explore-cell', {
      playerId: myPlayerId,
      targetPosition: loc,
      roomId,
      shouldExplore: true,
    });
  };

  const handleBoardDoubleClick = (celldata: CellData, loc: GridLocation) => {
    if (!isBoardReady || !socket) return;
    socket.emit('game:explore-cell', { targetPosition: loc, roomId, shouldExplore: false });
  };

  const handlePieceDragStart = (e: DragEvent<HTMLDivElement>, piece: PieceData) => {
    e.dataTransfer.setData('pieceId', piece.id);
    e.dataTransfer.effectAllowed = 'move';
    handlePieceClick(piece.id);
  };

  const handleCellDrop = (e: DragEvent<HTMLDivElement>, targetRow: number, targetCol: number) => {
    e.preventDefault();
    if (!isBoardReady || !socket) return;

    const draggedPieceId = e.dataTransfer.getData('pieceId');
    if (draggedPieceId) {
      // ドロップ（移動確定）したら一旦ハイライトを消す
      setHighlightedCells([]);

      socket.emit('game:move-player', {
        boardId: boardId,
        playerId: draggedPieceId,
        newPosition: { row: targetRow, col: targetCol },
        roomId,
      });
    }
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
      setHighlightedCells(updatedLocs);
    };
    socket.on('cell:update', handleCellUpdate);
    return () => {
      socket.off('cell:update', handleCellUpdate);
    };
  }, [socket]);

  // プレイヤー情報更新
  React.useEffect(() => {
    const handlePlayersUpdate = (updatedPlayers: Player[]) => {
      setPlayers(updatedPlayers);
    };
    socket.on('players:update', handlePlayersUpdate);
    return () => {
      socket.off('players:update', handlePlayersUpdate);
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
    <div style={{ textAlign: 'center' }}>
      {rows > 0 && cols > 0 ? (
        <GridBoard
          rows={rows}
          cols={cols}
          cellData={cells}
          pieces={pieces}
          changedCells={exploredCells}
          highlightendCells={highlightedCells}
          renderCell={MyCustomCellRenderer}
          onCellClick={handleBoardClick}
          onCellDoubleClick={handleBoardDoubleClick}
          onPieceClick={handlePieceClick}
          allowPieceDrag={true}
          onPieceDragStart={handlePieceDragStart}
          onPieceDrop={handleCellDrop}
        />
      ) : (
        <div
          style={{
            padding: '40px',
            textAlign: 'center',
            fontSize: '20px',
            color: '#ff79c6',
          }}
        >
          <p>エラー: 盤面データが正しくロードされませんでした。</p>
        </div>
      )}
    </div>
  );
}
