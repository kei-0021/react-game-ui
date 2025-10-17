import * as React from "react";

// --- 型定義: 絶対座標を使用 ---
type RandomCellData = {
  id: number;
  x: number; // X座標 (px)
  y: number; // Y座標 (px)
  color: string;
};

// --- 定数 ---
const NUM_RANDOM_CELLS = 50; // 配置するセルの数
const MAX_WIDTH = 800; // 配置範囲の最大幅 (px)
const MAX_HEIGHT = 600; // 配置範囲の最大高さ (px)
const CELL_SIZE = 50; // セルのサイズ (px)
const MAX_ATTEMPTS = 500; // 重ならない位置を探す最大試行回数

// 💡 修正点 1: 5種類の色を定義
const COLOR_PALETTE = [
  '#E74C3C', // 赤系 (Red)
  '#3498DB', // 青系 (Blue)
  '#2ECC71', // 緑系 (Green)
  '#F1C40F', // 黄系 (Yellow)
  '#9B59B6', // 紫系 (Purple)
];

// 💡 修正点 2: 定義した5色の中からランダムに選ぶ
const getRandomColor = () => {
  const index = Math.floor(Math.random() * COLOR_PALETTE.length);
  return COLOR_PALETTE[index];
};

// 2つのセル（矩形）が重なっているか判定する関数
const checkCollision = (cell1: { x: number, y: number }, cell2: { x: number, y: number }, size: number) => {
    // 矩形の重なり判定 (AABB)
    return (
        cell1.x < cell2.x + size &&
        cell1.x + size > cell2.x &&
        cell1.y < cell2.y + size &&
        cell1.y + size > cell2.y
    );
};

// --- スタイリングヘルパー関数 ---
const getCellStyle = (cell: RandomCellData): React.CSSProperties => ({
  position: 'absolute',
  left: cell.x,
  top: cell.y,
  width: CELL_SIZE,
  height: CELL_SIZE,
  backgroundColor: cell.color, // 5色の中の1色
  border: "2px solid #fff",
  borderRadius: "5px",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  fontSize: "10px",
  fontWeight: "bold",
  // 背景色に応じて文字色を黒に固定
  color: '#333', 
  cursor: "pointer",
  boxShadow: '0 0 10px rgba(0, 0, 0, 0.5)',
  transition: 'transform 0.1s',
  zIndex: cell.id,
});


export default function Board() {
  const [randomCells, setRandomCells] = React.useState<RandomCellData[]>([]);
  const [attemptMessage, setAttemptMessage] = React.useState("");

  // 重ならないランダム座標を生成するロジック
  const generateRandomPositions = () => {
    const newCells: RandomCellData[] = [];
    let placedCount = 0;
    
    for (let i = 0; i < NUM_RANDOM_CELLS; i++) {
      let attempts = 0;
      let newX, newY;
      let isColliding = true;

      // 重ならない位置が見つかるまで試行
      while (isColliding && attempts < MAX_ATTEMPTS) {
        newX = Math.floor(Math.random() * (MAX_WIDTH - CELL_SIZE));
        newY = Math.floor(Math.random() * (MAX_HEIGHT - CELL_SIZE));
        
        const newCellPos = { x: newX, y: newY };
        isColliding = false;

        // 既に配置された全てのセルと重なりチェック
        for (const existingCell of newCells) {
          if (checkCollision(newCellPos, existingCell, CELL_SIZE)) {
            isColliding = true;
            break;
          }
        }
        attempts++;
      }

      // 最大試行回数内に重ならない位置が見つかった場合のみ配置
      if (!isColliding) {
        newCells.push({
          id: i,
          x: newX!,
          y: newY!,
          color: getRandomColor(), // 5色から選択
        });
        placedCount++;
      }
    }
    
    if (placedCount < NUM_RANDOM_CELLS) {
        setAttemptMessage(`⚠️ ${NUM_RANDOM_CELLS}個中 ${placedCount}個しか配置できませんでした。配置密度が高すぎます。`);
    } else {
        setAttemptMessage("");
    }
    
    return newCells;
  };

  // 起動時に一度だけ配置
  React.useEffect(() => {
    setRandomCells(generateRandomPositions());
  }, []);

  const handleRandomize = () => {
    setRandomCells(generateRandomPositions());
  };

  const handleClick = (id: number) => {
    // クリックされたセルの色を、パレット内の次の色に切り替えるなどしても良いが、
    // ここではシンプルにランダムな色（パレット内）に再変更するロジックを維持
    setRandomCells(prev => 
        prev.map(cell => 
            cell.id === id ? { ...cell, color: getRandomColor() } : cell
        )
    );
  };
  
  // ボードコンテナのスタイル
  const boardContainerStyle: React.CSSProperties = {
      position: 'relative', 
      width: MAX_WIDTH,
      height: MAX_HEIGHT,
      border: "3px dashed #777",
      backgroundColor: "#1e1e1e",
      margin: "20px 0",
      overflow: 'hidden',
  };

  // --- レンダリング ---
  return (
    <div style={{ padding: "20px", backgroundColor: "#1e1e1e", minHeight: "100vh" }}>
      <h2 style={{ color: 'white' }}>Room ID: v1zv6a</h2>
      
      <button 
        onClick={handleRandomize} 
        style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer', backgroundColor: '#9B59B6', color: 'white', border: 'none', borderRadius: '4px' }}
      >
        🤯 重ならないようにランダム配置（5色）
      </button>
      
      <p style={{ color: '#aaa', fontSize: '12px', marginTop: '10px' }}>
          ${MAX_WIDTH}px x ${MAX_HEIGHT}px の範囲に ${NUM_RANDOM_CELLS} 個のマスを重なりなしで配置します。
      </p>
      
      {attemptMessage && <p style={{ color: '#E74C3C', fontWeight: 'bold' }}>{attemptMessage}</p>}


      {/* ボードのコンテナ */}
      <div style={boardContainerStyle}>
        {randomCells.map((cell) => (
          <div 
            key={cell.id}
            style={getCellStyle(cell)}
            onClick={() => handleClick(cell.id)}
          >
            {cell.id}
          </div>
        ))}
      </div>
    </div>
  );
}