import type { DragEvent } from 'react';
import * as React from 'react';
import type { CellData } from "../src/components/Board";
import Board from "../src/components/Board.js";
import type { PieceData } from "../src/types/piece.js"; // 拡張子を明示

// 初期データ（外部で定義された形状情報を含む）
const boardData = [
  [
    { id: 'a1', shapeType: 'square', backgroundColor: '#e9e9e9', content: '' },
    { id: 'a2', shapeType: 'square', backgroundColor: '#d0d0d0', content: '' },
    { id: 'a3', shapeType: 'square', backgroundColor: '#e9e9e9', content: '' },
    { id: 'a4', shapeType: 'square', backgroundColor: '#d0d0d0', content: '' },
    { id: 'a5', shapeType: 'square', backgroundColor: '#e9e9e9', content: '' },
  ],
  [
    { id: 'b1', shapeType: 'square', backgroundColor: '#d0d0d0', content: 'START' },
    { id: 'b2', shapeType: 'square', backgroundColor: '#e9e9e9', content: '' },
    { id: 'b3', shapeType: 'square', backgroundColor: '#d0d0d0', content: '' },
    { id: 'b4', shapeType: 'square', backgroundColor: '#e9e9e9', content: '' },
    { id: 'b5', shapeType: 'custom', backgroundColor: '#ff8a8a', content: 'STOP', customClip: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)' }, // カスタムの五角形
  ],
  [
    { id: 'c1', shapeType: 'square', backgroundColor: '#e9e9e9', content: '' },
    { id: 'c2', shapeType: 'custom', backgroundColor: '#fcd34d', content: '1マス進む', customClip: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' }, // カスタムのひし形
    { id: 'c3', shapeType: 'square', backgroundColor: '#e9e9e9', content: '' },
    { id: 'c4', shapeType: 'square', backgroundColor: '#d0d0d0', content: '' },
    { id: 'c5', shapeType: 'square', backgroundColor: '#e9e9e9', content: '' },
  ],
  [
    { id: 'd1', shapeType: 'square', backgroundColor: '#d0d0d0', content: '' },
    { id: 'd2', shapeType: 'square', backgroundColor: '#e9e9e9', content: '' },
    { id: 'd3', shapeType: 'square', backgroundColor: '#d0d0d0', content: '' },
    { id: 'd4', shapeType: 'square', backgroundColor: '#e9e9e9', content: '' },
    { id: 'd5', shapeType: 'square', backgroundColor: '#d0d0d0', content: '' },
  ],
  [
    { id: 'e1', shapeType: 'square', backgroundColor: '#e9e9e9', content: '' },
    { id: 'e2', shapeType: 'square', backgroundColor: '#d0d0d0', content: 'GO!' },
    { id: 'e3', shapeType: 'square', backgroundColor: '#e9e9e9', content: '' },
    { id: 'e4', shapeType: 'square', backgroundColor: '#d0d0d0', content: '' },
    { id: 'e5', shapeType: 'square', backgroundColor: '#e9e9e9', content: '' },
  ],
];

// ユーザーが定義するカスタムレンダラー
const MyCustomCellRenderer = (celldata: CellData, row: number, col: number) => {
  const baseStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: celldata.backgroundColor,
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
          clipPath: celldata.customClip as string, // ⭐ 外部から渡された無限の形状CSS
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

// コマの初期状態
const initialPieces: PieceData[] = [
  { id: 'p1', name: 'P1', color: '#10b981', location: { row: 0, col: 0 } }, // (0, 0)
  { id: 'p2', name: 'P2', color: '#3b82f6', location: { row: 4, col: 1 } }, // (4, 1)
];

// クリックハンドラ
const handleBoardClick = (celldata: CellData, row: number, col: number) => {
    // console.log(`Cell Clicked: ${celldata.id} at (${row}, ${col})`);
};

const handlePieceClick = (pieceId: string) => {
    console.log(`Piece Clicked: ${pieceId}`);
};



export default function GameBoardView() {
  const [pieces, setPieces] = React.useState(initialPieces);
  
  // ボードのサイズを取得 (5x5)
  const rows = boardData.length;
  const cols = boardData[0].length; 

  // 例: P1 を移動させるロジック (デモ用)
  const moveP1 = () => {
    setPieces(prev => {
        const p1 = prev.find(p => p.id === 'p1');
        if (p1) {
            // 🚀 完全にランダムな行と列を生成 (0からrows/cols-1の範囲)
            const newRow = Math.floor(Math.random() * rows);
            const newCol = Math.floor(Math.random() * cols);
            
            // 新しい位置を計算し、ピースの配列を更新
            return prev.map(p => p.id === 'p1' ? { ...p, location: { row: newRow, col: newCol } } : p);
        }
        return prev;
    });
  };

  const handlePieceDragStart = (e: DragEvent<HTMLDivElement>, piece: PieceData) => {
    console.log(`[Piece Drag Started]: ${piece.id} from (${piece.location.row}, ${piece.location.col})`);
    
    // ネイティブのドラッグAPIを使用してピースIDを転送データとして設定
    e.dataTransfer.setData('pieceId', piece.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleCellDrop = (e: DragEvent<HTMLDivElement>, targetRow: number, targetCol: number) => {
    e.preventDefault();
    
    // 1. ドラッグ開始時に保存したピースIDを取得
    const draggedPieceId = e.dataTransfer.getData('pieceId');
    
    if (draggedPieceId) {
        // 2. Stateを更新して座標を移動させる
        setPieces(prev => {
            return prev.map(p => 
                p.id === draggedPieceId 
                    ? { ...p, location: { row: targetRow, col: targetCol } } 
                    : p
            );
        });
        console.log(`[Piece Dropped]: ${draggedPieceId} to (${targetRow}, ${targetCol})`);
    }
};

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '10px' }}>カスタムボードゲームUI</h1>
      <p style={{ marginBottom: '20px', color: '#666' }}>マス目の形状は外部レンダラーで定義され、コマは独立して配置されます。</p>
      
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
        P1をランダムに移動 (デモ)
      </button>

      <Board 
        rows={rows} // 5
        cols={cols} // 5
        boardData={boardData} 
        pieces={pieces} // コマのデータを渡す
        renderCell={MyCustomCellRenderer} // 形状定義関数を渡す
        onCellClick={handleBoardClick}
        onPieceClick={handlePieceClick}
        allowPieceDrag={true}
        onPieceDragStart={handlePieceDragStart}
        onCellDrop={handleCellDrop} 
      />
    </div>
  );
}
