import * as React from 'react';
import { DragEvent } from 'react';
import { Socket } from "socket.io-client";
import type { CellData } from "../src/components/Board"; // ⭐ 拡張子を削除
import Board from "../src/components/Board"; // ⭐ 拡張子を削除
import type { PieceData } from "../src/types/piece"; // ⭐ 拡張子を削除
import { PlayerId } from '../src/types/player'; // ⭐ 拡張子を削除
// サーバーから確定盤面を受け取るため、クライアント側の初期データは参照のみとし、
// 初期状態では使用しない

// 座標の型を定義
type Location = {
    row: number;
    col: number;
};

type GameBoardViewProps = {
  socket: Socket;
  myPlayerId: PlayerId | null;
}

// ユーザーが定義するカスタムレンダラー
const MyCustomCellRenderer = (celldata: CellData, row: number, col: number) => {
  const baseStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    color: '#333',
    fontWeight: 'bold',
    fontSize: '16px',
    textAlign: 'center',
    lineHeight: '1.2',
  };

  if (celldata.shapeType === 'circle') {
    return (
      <div style={{ ...baseStyle, borderRadius: '50%' }}>
        {celldata.content}
      </div>
    );
  }

  if (celldata.shapeType === 'custom') {
    // 外部データ（customClip）に基づいて、任意のCSS形状を適用
    return (
      <div 
        style={{ 
          ...baseStyle, 
          clipPath: celldata.customClip as string, 
          border: '2px dashed #000',
          backgroundColor: celldata.backgroundColor === '#ff8a8a' ? '#ff3b3b' : celldata.backgroundColor,
          color: 'white'
        }}
      >
        {celldata.content}
      </div>
    );
  }

  // デフォルト（正方形）
  return (
    <div style={{ ...baseStyle, border: '1px solid #3333331a' }}>
      {celldata.content}
    </div>
  );
};

const initialPieces: PieceData[] = [];
const handlePieceClick = (pieceId: string) => {
    console.log(`Piece Clicked: ${pieceId}`);
};

// サーバーから受け取るプレイヤーの型
type ServerPlayer = {
    id: PlayerId;
    name: string;
    cards: any[];
    score: number;
    resources: any[];
    position: Location; // サーバー側と一致
};

// 暫定的な空のボードデータ
const EMPTY_BOARD: CellData[][] = [[], []];

export default function GameBoardView({
  socket,
  myPlayerId
}: GameBoardViewProps) {
  const [pieces, setPieces] = React.useState(initialPieces);
  
  // 初期ボード状態を空にし、サーバーからの受信を待つ
  const [deepSeaCells, setDeepSeaCells] = React.useState<CellData[][]>(EMPTY_BOARD);
  
  const [isBoardReady, setIsBoardReady] = React.useState(false);
  const [serverPlayers, setServerPlayers] = React.useState<ServerPlayer[]>([]);
  
  // 探索済みマス目の状態 (サーバーから送られてくるデータを格納する)
  const [exploredCells, setExploredCells] = React.useState<Location[]>([]);

  // ボードのサイズを計算
  const rows = deepSeaCells.length;
  const cols = deepSeaCells[0]?.length || 0; 
  
  // handleBoardClick をコンポーネント内に定義
  const handleBoardClick = (celldata: CellData, row: number, col: number) => {
    if (!isBoardReady) return; 

    // ⭐ 修正ポイント: 移動リクエストを削除し、探索リクエストに変更

    // サーバーにマス目探索要求を送信 (移動ではない)
    if (socket && myPlayerId) {
        console.log(`[Client] Sending EXPLORE request for player ${myPlayerId} to (${row}, ${col})`);
        
        // サーバー側の実装に合わせてイベント名を調整してください
        socket.emit("game:explore-cell", { // ⭐ イベント名を "game:explore-cell" に変更
            playerId: myPlayerId,
            targetPosition: { row, col } // 座標オブジェクトを送信
        });
        
        // 更新はサーバーからのブロードキャストに任せる。
    }
  };

  const moveP1 = () => {
    if (!isBoardReady || rows === 0 || cols === 0) return;

    if (socket && myPlayerId) {
        const newRow = Math.floor(Math.random() * rows);
        const newCol = Math.floor(Math.random() * cols);

        socket.emit("game:move-player", { 
            playerId: myPlayerId,
            newPosition: { row: newRow, col: newCol }
        });
        console.log(`[Client] Sending RANDOM move request for player ${myPlayerId} to (${newRow}, ${newCol})`);
    }
  };

  const handlePieceDragStart = (e: DragEvent<HTMLDivElement>, piece: PieceData) => {
    console.log(`[Piece Drag Started]: ${piece.id} from (${piece.location.row}, ${piece.location.col})`);
    e.dataTransfer.setData('pieceId', piece.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleCellDrop = (e: DragEvent<HTMLDivElement>, targetRow: number, targetCol: number) => {
      e.preventDefault();
      
      if (!isBoardReady) return; 

      const draggedPieceId = e.dataTransfer.getData('pieceId');
      
      if (draggedPieceId && myPlayerId && socket) {
          // サーバーにドラッグ&ドロップによる移動を要求
          socket.emit("game:move-player", { 
              playerId: draggedPieceId, // ドラッグされたピースのID = プレイヤーIDと仮定
              newPosition: { row: targetRow, col: targetCol }
          });
          
          // 更新はサーバーからのブロードキャストに任せる。
          console.log(`[Piece Dropped]: ${draggedPieceId} to r${targetRow}c${targetCol} (Sent to server)`);
      }
  };

  // ------------------------------------
  // ⭐ 1. サーバーからの確定盤面同期 (初期設定)
  // ------------------------------------
  React.useEffect(() => {
    const handleInitBoard = (boardData: CellData[][]) => {
      console.log("[Socket] サーバーから確定盤面データを受信しました。");
      if (boardData && boardData.length > 0) {
        setDeepSeaCells(boardData);
        setIsBoardReady(true);
      } else {
        console.warn("[Socket] 受信した盤面データが空または無効です。");
      }
    };

    socket.on("game:init-board", handleInitBoard);

    return () => {
      socket.off("game:init-board", handleInitBoard);
    };
  }, [socket]);


  // ------------------------------------
  // ⭐ 2. サーバーからの探索済みマス目リスト同期 (新規追加)
  // ------------------------------------
  React.useEffect(() => {
    const handleExploredUpdate = (updatedExploredCells: Location[]) => {
      console.log("[Socket] 探索済みマス目リストが更新されました。", updatedExploredCells);
      // サーバーから送られてきた最新のリストでローカルの状態を上書き
      setExploredCells(updatedExploredCells);
    };
    
    socket.on("board-update", handleExploredUpdate); 

    return () => {
      socket.off("board-update", handleExploredUpdate);
    };
  }, [socket]);


  // ------------------------------------
  // 3. サーバーからのプレイヤー状態同期 (既存)
  // ------------------------------------
  React.useEffect(() => {
    const handlePlayersUpdate = (updatedPlayers: ServerPlayer[]) => {
      console.log("[Socket] プレイヤー情報が更新されました。", updatedPlayers);
      setServerPlayers(updatedPlayers);
    };

    socket.on("players:update", handlePlayersUpdate);

    return () => {
      socket.off("players:update", handlePlayersUpdate);
    };
  }, [socket]);

  // ------------------------------------
  // 4. serverPlayers に基づいてコマ (pieces) を更新 (既存)
  // ------------------------------------
  React.useEffect(() => {
    setPieces(prevPieces => {
        const newPieces: PieceData[] = [];
        serverPlayers.forEach(p => {
            const existingPiece = prevPieces.find(piece => piece.id === p.id);
            const location: Location = p.position; 

            if (existingPiece) {
                newPieces.push({ ...existingPiece, location });
            } else {
                const defaultColor = p.id === myPlayerId ? '#ff00ff' : '#000000';
                const defaultName = p.name || `P${newPieces.length + 1}`;
                newPieces.push({ 
                    id: p.id, 
                    name: defaultName, 
                    color: defaultColor,
                    location 
                });
            }
        });
        
        return newPieces;
    });
  }, [serverPlayers, myPlayerId]);

  // ------------------------------------

  // 盤面がロードされるまでローディング表示
  if (!isBoardReady) {
    return (
        <div style={{ padding: '40px', textAlign: 'center', fontSize: '20px', color: '#333' }}>
            <p>サーバーから盤面データをロード中...</p>
        </div>
    );
  }

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '10px' }}>ディープ・アビス (Deep Abyss)</h1>
      <p style={{ marginBottom: '20px', color: '#666' }}>クリックまたはドラッグ&ドロップで移動し、サーバー経由で他のプレイヤーとコマの位置を同期します。</p>

      <button 
        onClick={moveP1}
        style={{
          padding: '10px 20px',
          backgroundColor: '#10b981',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          marginBottom: '20px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
          fontWeight: 'bold'
        }}
      >
        P1をランダムに移動 (サーバー同期テスト)
      </button>

      {rows > 0 && cols > 0 ? (
        <Board 
          rows={rows} 
          cols={cols} 
          boardData={deepSeaCells} 
          pieces={pieces} 
          // サーバーから取得した探索済みリストを使用
          changedCells={exploredCells} 

          renderCell={MyCustomCellRenderer} 
          onCellClick={handleBoardClick}
          onPieceClick={handlePieceClick}
          allowPieceDrag={true}
          onPieceDragStart={handlePieceDragStart}
          onCellDrop={handleCellDrop} 
        />
      ) : (
          <div style={{ padding: '40px', textAlign: 'center', fontSize: '20px', color: '#ff6347' }}>
            <p>エラー: 盤面データが正しくロードされませんでした。</p>
          </div>
      )}
    </div>
  );
}
