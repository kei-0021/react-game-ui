import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import styles from './Board.module.css';
import { Cell } from './Cell.js';
import { Piece } from './Piece.js';
/**
 * 盤面（グリッド）を表示し、セルや駒のインタラクション、ドラッグ＆ドロップを管理する
 * @param {number} rows - 盤面の行数
 * @param {number} cols - 盤面の列数
 * @param {CellData[][]} cellData - 各セルの状態を持つ2次元配列
 * @param {PieceData[]} pieces - 盤面上に配置される駒（Piece）のデータ
 * @param {GridLocation[]} changedCells - 状態変化（ハイライト等）を適用する座標のリスト
 * @param {boolean} [allowPieceDrag=false] - 駒のドラッグ操作を許可するかどうか
 * @param {(cellData: CellData, row: number, col: number) => React.ReactNode} renderCell - 各マスの内部コンテンツを描画する関数
 * @param {(cellData: CellData, loc: GridLocation) => void} onCellClick - セルがクリックされた時の処理
 * @param {(cellData: CellData, loc: GridLocation) => void} onCellDoubleClick - セルがダブルクリックされた時の処理
 * @param {(pieceId: string) => void} onPieceClick - 駒がクリックされた時の処理
 * @param {(e: DragEvent<HTMLDivElement>, piece: PieceData) => void} onPieceDragStart - 駒のドラッグが開始された時の処理
 * @param {(e: React.DragEvent<HTMLDivElement>, row: number, col: number) => void} onPieceDrop - セルに駒がドロップされた時の処理
 * @param {number} widht - 横幅
 * @param {number} height - 縦幅
 */
export function GridBoard({ rows, cols, cellData, pieces, changedCells, renderCell, onCellClick, onCellDoubleClick, onPieceClick, allowPieceDrag = false, onPieceDragStart, onPieceDrop, width = 800, height = 800, }) {
    const handleCellClick = (loc) => {
        const data = cellData[loc.row][loc.col];
        onCellClick(data, loc);
    };
    const handleCellDoubleClick = (loc) => {
        const data = cellData[loc.row][loc.col];
        onCellDoubleClick(data, loc);
    };
    const handlePieceDragStart = (e, piece) => {
        onPieceDragStart(e, piece);
    };
    const boardStyle = {
        '--board-rows': rows,
        '--board-cols': cols,
        display: 'grid',
        gridTemplateRows: `repeat(${rows}, 1fr)`,
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gap: '4px',
        width: width,
        height: height,
        position: 'relative',
    };
    return (_jsxs("div", { className: styles.boardContainer, style: boardStyle, children: [cellData.map((rowArr, row) => rowArr.map((originalCellData, col) => {
                const isChanged = changedCells.some((loc) => loc.row === row && loc.col === col);
                const effectiveContent = isChanged ? originalCellData.changedContent : originalCellData.content;
                const cellDataForRenderer = {
                    ...originalCellData,
                    content: effectiveContent,
                };
                const loc = { row, col };
                return (_jsx(Cell, { locationData: loc, cellData: cellDataForRenderer, onClick: handleCellClick, onDoubleClick: handleCellDoubleClick, onDrop: (e) => onPieceDrop(e, row, col), onDragOver: (e) => e.preventDefault(), changed: isChanged, children: renderCell(cellDataForRenderer, row, col) }, originalCellData.id));
            })), pieces.map((piece) => {
                const sameLocationPieces = pieces.filter((p) => p.location.row === piece.location.row && p.location.col === piece.location.col);
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
                const pieceStyle = {
                    gridArea: `${piece.location.row + 1} / ${piece.location.col + 1} / span 1 / span 1`,
                    alignSelf: 'center',
                    justifySelf: 'center',
                    transform: `translate(${offsetX}px, ${offsetY}px)`,
                    transition: 'transform 0.3s ease-in-out',
                };
                return (_jsx(Piece, { piece: piece, style: pieceStyle, onClick: onPieceClick, isDraggable: allowPieceDrag, onDragStart: (e) => handlePieceDragStart(e, piece) }, piece.id));
            })] }));
}
