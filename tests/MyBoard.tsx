import * as React from 'react';
import { DragEvent } from 'react';
import { Socket } from "socket.io-client";
import type { CellData } from "../src/components/Board";
import Board from "../src/components/Board";
import { PlayerId } from '../src/types/definition';
import type { PieceData } from "../src/types/piece";
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
    // ⭐ 修正: テキスト色を明るい色に変更し、濃い背景でも見えるように
    color: '#e0e0e0', 
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
          // ⭐ 修正: 枠線を濃い背景に合うように調整
          border: '2px dashed rgba(255, 255, 255, 0.4)', 
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
    <div 
      style={{ 
        ...baseStyle, 
        // ⭐ 修正: グリッド線の色をダークなテーマに合わせる
        border: '1px solid rgba(255, 255, 255, 0.1)', 
      }}
    >
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

  // ⭐ ダブルクリック処理: 探索済みマーク解除要求を送信
  const handleBoardDoubleClick = (celldata: CellData, row: number, col: number) => {
    if (!isBoardReady) return; 

    // サーバーに探索済みマーク解除要求を送信
    if (socket && myPlayerId) {
        console.log(`[Client] Sending UNEXPLORE request for player ${myPlayerId} to (${row}, ${col})`);
        
        // サーバー側の実装に合わせて新しいイベント名を使用 (例: game:unexplore-cell)
        socket.emit("game:unexplore-cell", { // ⭐ 新しいイベント名
            targetPosition: { row, col } // 座標オブジェクトを送信
        });
        
        // 更新はサーバーからのブロードキャストに任せる。
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
                // ⭐ 修正: コマの色をダークテーマで目立つネオンカラーに変更
                const defaultColor = p.id === myPlayerId ? 
                    '#4fc3f7' :  // 明るい水色 (ハイライト)
                    '#242a2aff';   // シアン (他のプレイヤー)
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
    // ⭐ 修正: ローディング表示のテキスト色をダークテーマに合わせる
    return (
        <div style={{ padding: '40px', textAlign: 'center', fontSize: '20px', color: '#e0e0e0' }}>
            <p>サーバーから盤面データをロード中...</p>
        </div>
    );
  }

  return (
    <div style={{ textAlign: 'center' }}>

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
          onCellDoubleClick={handleBoardDoubleClick} 
          onPieceClick={handlePieceClick}
          allowPieceDrag={true}
          onPieceDragStart={handlePieceDragStart}
          onCellDrop={handleCellDrop} 
        />
      ) : (
          // ⭐ 修正: エラー表示のテキスト色をダークテーマに合わせる
          <div style={{ padding: '40px', textAlign: 'center', fontSize: '20px', color: '#ff79c6' }}>
            <p>エラー: 盤面データが正しくロードされませんでした。</p>
          </div>
      )}
    </div>
  );
}