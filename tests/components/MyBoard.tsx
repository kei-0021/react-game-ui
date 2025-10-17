// tests/components/MyBoard.tsx
import * as React from 'react';
import { DragEvent } from 'react';
import { Socket } from "socket.io-client";
import type { CellData } from "../../src/components/Cell";
import GridBoard from "../../src/components/GridBoard";
import type { PlayerId } from '../../src/types/definition';
import type { PieceData } from "../../src/types/piece";

// 💡 修正 1: LocationをGridLocationにリネームし、Boardコンポーネントとの整合性を高めます
type GridLocation = { row: number; col: number };

type GameBoardViewProps = {
  socket: Socket;
  roomId: string;
  myPlayerId: PlayerId | null;
}

const MyCustomCellRenderer = (celldata: CellData, row: number, col: number) => {
  const baseStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    color: '#e0e0e0', 
    fontWeight: 'bold',
    fontSize: '16px',
    textAlign: 'center',
    lineHeight: '1.2',
  };

  if (celldata.shapeType === 'circle') {
    return <div style={{ ...baseStyle, borderRadius: '50%' }}>{celldata.content}</div>;
  }

  if (celldata.shapeType === 'custom') {
    return (
      <div style={{ 
        ...baseStyle, 
        clipPath: celldata.customClip as string, 
        border: '2px dashed rgba(255,255,255,0.4)', 
        backgroundColor: celldata.backgroundColor === '#ff8a8a' ? '#ff3b3b' : celldata.backgroundColor,
        color: 'white'
      }}>
        {celldata.content}
      </div>
    );
  }

  return (
    <div style={{ ...baseStyle, border: '1px solid rgba(255,255,255,0.1)' }}>
      {celldata.content}
    </div>
  );
};

const initialPieces: PieceData[] = [];

const handlePieceClick = (pieceId: string) => {
  console.log(`Piece Clicked: ${pieceId}`);
};

type ServerPlayer = {
  id: PlayerId;
  name: string;
  cards: any[];
  score: number;
  resources: any[];
  position: GridLocation; // 💡 Location を GridLocation に変更
};

const EMPTY_BOARD: CellData[][] = [[], []];

export default function GameBoardView({ socket, myPlayerId, roomId }: GameBoardViewProps) {
  const [pieces, setPieces] = React.useState(initialPieces);
  const [deepSeaCells, setDeepSeaCells] = React.useState<CellData[][]>(EMPTY_BOARD);
  const [isBoardReady, setIsBoardReady] = React.useState(false);
  const [serverPlayers, setServerPlayers] = React.useState<ServerPlayer[]>([]);
  const [exploredCells, setExploredCells] = React.useState<GridLocation[]>([]); // 💡 Location を GridLocation に変更

  const rows = deepSeaCells.length;
  const cols = deepSeaCells[0]?.length || 0; 

  // 💡 修正 2: handleBoardClick の引数を (celldata, loc) に変更
  const handleBoardClick = (celldata: CellData, loc: GridLocation) => {
    if (!isBoardReady || !socket || !myPlayerId) return;
    console.log(`[Client] Sending EXPLORE request for player ${myPlayerId} to (${loc.row},${loc.col})`);
    socket.emit("game:explore-cell", { playerId: myPlayerId, targetPosition: loc, roomId });
  };

  // 💡 修正 3: handleBoardDoubleClick の引数を (celldata, loc) に変更
  const handleBoardDoubleClick = (celldata: CellData, loc: GridLocation) => {
    if (!isBoardReady || !socket) return;
    console.log(`[Client] Sending UNEXPLORE request to (${loc.row},${loc.col})`);
    socket.emit("game:unexplore-cell", { targetPosition: loc, roomId });
  };

  const handlePieceDragStart = (e: DragEvent<HTMLDivElement>, piece: PieceData) => {
    console.log(`[Piece Drag Started]: ${piece.id} from (${piece.location.row}, ${piece.location.col})`);
    e.dataTransfer.setData('pieceId', piece.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleCellDrop = (e: DragEvent<HTMLDivElement>, targetRow: number, targetCol: number) => {
    e.preventDefault();
    if (!isBoardReady || !socket) return;

    const draggedPieceId = e.dataTransfer.getData('pieceId');
    if (draggedPieceId) {
      socket.emit("game:move-player", { 
        playerId: draggedPieceId, 
        // 💡 修正 4: ドロップイベントは row/col で渡されますが、socketへの送信はLocation形式に変換します
        newPosition: { row: targetRow, col: targetCol },
        roomId
      });
      console.log(`[Piece Dropped]: ${draggedPieceId} to r${targetRow}c${targetCol}`);
    }
  };

  // ------------------- Socket Effects -------------------
  // ... (Socket Effectsは変更なし) ...
  React.useEffect(() => {
    const handleInitBoard = (boardData: CellData[][]) => {
      console.log("[Socket] GridBoard initialized.");
      if (boardData.length > 0) {
        setDeepSeaCells(boardData);
        setIsBoardReady(true);
      }
    };
    socket.on("game:init-board", handleInitBoard);
    return () => {
      socket.off("game:init-board", handleInitBoard
    )};
  }, [socket]);

  React.useEffect(() => {
    const handleExploredUpdate = (updatedExploredCells: GridLocation[]) => { // 💡 GridLocation に変更
      console.log("[Socket] Explored cells updated.", updatedExploredCells);
      setExploredCells(updatedExploredCells);
    };
    socket.on("board-update", handleExploredUpdate);
    return () => {
      socket.off("board-update", handleExploredUpdate)
    };
  }, [socket]);

  React.useEffect(() => {
    const handlePlayersUpdate = (updatedPlayers: ServerPlayer[]) => {
      console.log("[Socket] Players updated.", updatedPlayers);
      setServerPlayers(updatedPlayers);
    };
    socket.on("players:update", handlePlayersUpdate);
    return () => {
      socket.off("players:update", handlePlayersUpdate)
    };
  }, [socket]);

  React.useEffect(() => {
    setPieces(prevPieces => {
      const newPieces: PieceData[] = [];
      serverPlayers.forEach(p => {
        const existingPiece = prevPieces.find(piece => piece.id === p.id);
        const location: GridLocation = p.position; // 💡 GridLocation に変更
        if (existingPiece) {
          newPieces.push({ ...existingPiece, location });
        } else {
          const defaultColor = p.id === myPlayerId ? '#4fc3f7' : '#242a2aff';
          const defaultName = p.name || `P${newPieces.length + 1}`;
          newPieces.push({ id: p.id, name: defaultName, color: defaultColor, location });
        }
      });
      return newPieces;
    });
  }, [serverPlayers, myPlayerId]);

  if (!isBoardReady) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', fontSize: '20px', color: '#e0e0e0' }}>
        <p>サーバーから盤面データをロード中...</p>
      </div>
    );
  }

  return (
    <div style={{ textAlign: 'center' }}>
      {rows > 0 && cols > 0 ? (
        // 💡 修正 5: GridBoard に GridLocation 型を渡す (型安全性のため)
        <GridBoard
          rows={rows} 
          cols={cols} 
          boardData={deepSeaCells} 
          pieces={pieces} 
          changedCells={exploredCells} 
          renderCell={MyCustomCellRenderer} 
          
          // 💡 修正 6: イベントハンドラは関数そのものを渡します
          onCellClick={handleBoardClick}
          onCellDoubleClick={handleBoardDoubleClick} 
          
          onPieceClick={handlePieceClick}
          allowPieceDrag={true}
          onPieceDragStart={handlePieceDragStart}
          onCellDrop={handleCellDrop} 
        />
      ) : (
        <div style={{ padding: '40px', textAlign: 'center', fontSize: '20px', color: '#ff79c6' }}>
          <p>エラー: 盤面データが正しくロードされませんでした。</p>
        </div>
      )}
    </div>
  );
}