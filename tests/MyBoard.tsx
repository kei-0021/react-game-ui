// react-game-ui/tests/MyBoard.tsx

import * as React from 'react';
import { DragEvent } from 'react';
import type { CellData } from "../src/components/Board";
import Board from "../src/components/Board.js";
import type { PieceData } from "../src/types/piece.js";
import originalDeepSeaCells from "./data/deepSeaCells.json";

// 座標の型を定義
type Location = {
    row: number;
    col: number;
};

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

const handlePieceClick = (pieceId: string) => {
    console.log(`Piece Clicked: ${pieceId}`);
};


// -----------------------------------------------------
// ⭐ フィッシャー・イェーツ・シャッフルアルゴリズム
// -----------------------------------------------------
const shuffleArray = (array: any[]) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
};


// -----------------------------------------------------
// ⭐ 修正: 全てのマスをシャッフルし、新しい盤面を生成する関数
// -----------------------------------------------------
const createRandomBoard = (originalCells: CellData[][]): CellData[][] => {
    const rows = originalCells.length;
    const cols = originalCells[0].length; 
    
    // 1. 全てのマス目データ（特殊マス含む）を一つの配列に平坦化
    let allCells: CellData[] = [];
    originalCells.forEach(rowArr => {
        allCells = allCells.concat(rowArr);
    });

    // 2. 全てのマスをシャッフル
    shuffleArray(allCells);

    // 3. シャッフルされたマス目を、新しい二次元配列に再構成
    const newBoard: CellData[][] = [];
    let cellIndex = 0;

    for (let r = 0; r < rows; r++) {
        const newRow: CellData[] = [];
        for (let c = 0; c < cols; c++) {
            const originalCell = allCells[cellIndex];
            
            // ⭐ 新しい座標に合わせてIDを更新し、マス目を配置
            newRow.push({ 
                ...originalCell, 
                id: `r${r}c${c}` // 新しい座標に基づいたIDを割り当てる
            });
            cellIndex++;
        }
        newBoard.push(newRow);
    }
    
    return newBoard;
};

export default function GameBoardView() {
  const [pieces, setPieces] = React.useState(initialPieces);
  const [deepSeaCells, setDeepSeaCells] = React.useState<CellData[][]>(
      createRandomBoard(originalDeepSeaCells)
  );

  // ⭐ 1. 探索済みマス目の状態をコンポーネント内に定義
  const [exploredCells, setExploredCells] = React.useState<Location[]>(
      initialPieces.map(p => p.location)
  );

  // ボードのサイズを取得 
  const rows = deepSeaCells.length;
  const cols = deepSeaCells[0].length; 
  
  // ⭐ 2. ユーティリティ関数をコンポーネント内に定義
  const isExplored = (row: number, col: number) => {
    return exploredCells.some(loc => loc.row === row && loc.col === col);
  }

  // ⭐ 3. マスを探索済みとしてマークする関数をコンポーネント内に定義
  const markCellAsExplored = (row: number, col: number) => {
    if (!isExplored(row, col)) {
        setExploredCells(prev => [...prev, { row, col }]);
        console.log(`[Exploration]: Cell (${row}, ${col}) marked as Explored (Color change!).`);
    }
  };
  
  // ⭐ 4. handleBoardClick をコンポーネント内に定義
  const handleBoardClick = (celldata: CellData, row: number, col: number) => {
      // ユーザーがクリックしたマスを探索済みとしてマークする
      markCellAsExplored(row, col);
      // その他のクリック処理があればここに追加
  };

  const moveP1 = () => {
    setPieces(prev => {
        const p1 = prev.find(p => p.id === 'p1');
        if (p1) {
            const newRow = Math.floor(Math.random() * rows);
            const newCol = Math.floor(Math.random() * cols);
            return prev.map(p => p.id === 'p1' ? { ...p, location: { row: newRow, col: newCol } } : p);
        }
        return prev;
    });
  };

  const handlePieceDragStart = (e: DragEvent<HTMLDivElement>, piece: PieceData) => {
    console.log(`[Piece Drag Started]: ${piece.id} from (${piece.location.row}, ${piece.location.col})`);
    e.dataTransfer.setData('pieceId', piece.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleCellDrop = (e: DragEvent<HTMLDivElement>, targetRow: number, targetCol: number) => {
      e.preventDefault();
      
      const draggedPieceId = e.dataTransfer.getData('pieceId');
      
      if (draggedPieceId) {
          const droppedCellData = deepSeaCells[targetRow][targetCol];
          
          // 1. ピースの移動
          setPieces(prev => {
              return prev.map(p => 
                  p.id === draggedPieceId 
                      ? { ...p, location: { row: targetRow, col: targetCol } } 
                      : p
              );
          });
          
          // 2. ドロップされたマスも探索済みとしてマーク (移動による探索)
          markCellAsExplored(targetRow, targetCol);

          // 3. ゲームロジックの実行
          console.log(`[Piece Dropped]: ${draggedPieceId} to ${droppedCellData.id}`);

          if (droppedCellData.content === '⚠️') {
              console.log(`🚨 WARNマス処理を実行。`);
          } else if (droppedCellData.content === '💎') {
              console.log(`✨ RELICマス処理を実行。`);
          }
      }
  };

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '10px' }}>ディープ・アビス (Deep Abyss)</h1>
      <p style={{ marginBottom: '20px', color: '#666' }}>クリックでマス目が探索済みになり、色が変わります。コマをドラッグ&ドロップしても移動後のマスが探索済みになります。</p>
      
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
        rows={rows} 
        cols={cols} 
        boardData={deepSeaCells} 
        pieces={pieces} 
        // ⭐ 修正: Boardコンポーネントに探索済みリストを正しく渡す
        changedCells={exploredCells} 

        renderCell={MyCustomCellRenderer} 
        onCellClick={handleBoardClick} // クリック時に探索状態を更新
        onPieceClick={handlePieceClick}
        allowPieceDrag={true}
        onPieceDragStart={handlePieceDragStart}
        onCellDrop={handleCellDrop} 
      />
    </div>
  );
}