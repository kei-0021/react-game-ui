// tests/components/MyBoard.tsx
import * as React from 'react';
import { DragEvent } from 'react';
import { Socket } from 'socket.io-client';
import type { CellData } from '../../src/components/Cell';
import { GridBoard } from '../../src/components/GridBoard';
import type { PieceId, PlayerId } from '../../src/types/definition';
import type { PieceData } from '../../src/types/piece';
import type { Player } from '../../src/types/player';

type GridLocation = { row: number; col: number };

type GameBoardViewProps = {
  socket: Socket;
  roomId: string;
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

const handlePieceClick = (pieceId: PieceId) => {};

const EMPTY_BOARD: CellData[] = [];

export default function GameBoardView({ socket, myPlayerId, roomId }: GameBoardViewProps) {
  const [pieces, setPieces] = React.useState(initialPieces);
  const [deepSeaCells, setDeepSeaCells] = React.useState<CellData[]>(EMPTY_BOARD);
  const [isBoardReady, setIsBoardReady] = React.useState(false);
  const [players, setPlayers] = React.useState<Player[]>([]);
  const [exploredCells, setExploredCells] = React.useState<GridLocation[]>([]);

  // IDから盤面の最大行列数を計算（一次元配列対応）
  const rows =
    deepSeaCells.length > 0
      ? Math.max(...deepSeaCells.map((c) => parseInt(c.id.match(/r(\d+)/)?.[1] || '0', 10))) + 1
      : 0;
  const cols =
    deepSeaCells.length > 0
      ? Math.max(...deepSeaCells.map((c) => parseInt(c.id.match(/c(\d+)/)?.[1] || '0', 10))) + 1
      : 0;

  const handleBoardClick = (celldata: CellData, loc: GridLocation) => {
    if (!isBoardReady || !socket || !myPlayerId) return;
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
  };

  const handleCellDrop = (e: DragEvent<HTMLDivElement>, targetRow: number, targetCol: number) => {
    e.preventDefault();
    if (!isBoardReady || !socket) return;

    const draggedPieceId = e.dataTransfer.getData('pieceId');
    if (draggedPieceId) {
      socket.emit('game:move-player', {
        playerId: draggedPieceId,
        newPosition: { row: targetRow, col: targetCol },
        roomId,
      });
    }
  };

  // ------------------- Socket Effects -------------------
  React.useEffect(() => {
    const handleInitBoard = (boardData: CellData[]) => {
      if (boardData && boardData.length > 0) {
        setDeepSeaCells(boardData);
        setIsBoardReady(true);
      }
    };
    socket.on('game:init-board', handleInitBoard);
    return () => {
      socket.off('game:init-board', handleInitBoard);
    };
  }, [socket]);

  React.useEffect(() => {
    const handleExploredUpdate = (updatedExploredCells: GridLocation[]) => {
      setExploredCells(updatedExploredCells);
    };
    socket.on('board-update', handleExploredUpdate);
    return () => {
      socket.off('board-update', handleExploredUpdate);
    };
  }, [socket]);

  React.useEffect(() => {
    const handlePlayersUpdate = (updatedPlayers: Player[]) => {
      setPlayers(updatedPlayers);
    };
    socket.on('players:update', handlePlayersUpdate);
    return () => {
      socket.off('players:update', handlePlayersUpdate);
    };
  }, [socket]);

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
          cellData={deepSeaCells}
          pieces={pieces}
          changedCells={exploredCells}
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
