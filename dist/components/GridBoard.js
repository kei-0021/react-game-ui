import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import styles from './Board.module.css';
import { Cell } from './Cell.js';
import Piece from './Piece.js';
export default function GridBoard({ rows, cols, boardData, pieces, changedCells, renderCell, onCellClick, onCellDoubleClick, onPieceClick, allowPieceDrag = false, onPieceDragStart, onCellDrop }) {
    // 💡 修正点 3: イベントハンドラを GridLocation オブジェクトで受け取るように変更
    const handleCellClick = (loc) => {
        const data = boardData[loc.row][loc.col];
        onCellClick(data, loc);
    };
    const handleCellDoubleClick = (loc) => {
        const data = boardData[loc.row][loc.col];
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
        width: '600px',
        height: '600px',
        position: 'relative',
    };
    return (_jsxs("div", { className: styles.boardContainer, style: boardStyle, children: [boardData.map((rowArr, row) => (rowArr.map((originalCellData, col) => {
                const isChanged = changedCells.some(loc => loc.row === row && loc.col === col);
                const effectiveContent = isChanged
                    ? originalCellData.changedContent
                    : originalCellData.content;
                const cellDataForRenderer = {
                    ...originalCellData,
                    content: effectiveContent
                };
                // 💡 修正点 4: Location オブジェクトを生成
                const loc = { row, col };
                return (
                // 💡 修正点 5: Cell にジェネリクス型 (GridLocation) を適用
                _jsx(Cell, { 
                    // 💡 修正点 6: Props名を 'locationData' に変更し、loc オブジェクトを渡す
                    locationData: loc, cellData: cellDataForRenderer, 
                    // 💡 修正点 7: イベントハンドラは関数そのものを渡す (Cell側でlocを引数に実行される)
                    onClick: handleCellClick, onDoubleClick: handleCellDoubleClick, onDrop: (e) => onCellDrop(e, row, col), onDragOver: (e) => e.preventDefault(), changed: isChanged, children: renderCell(cellDataForRenderer, row, col) }, originalCellData.id));
            }))), pieces.map(piece => {
                // ... (コマのロジックは変更なし)
                const sameLocationPieces = pieces.filter(p => p.location.row === piece.location.row && p.location.col === piece.location.col);
                const groupIndex = sameLocationPieces.findIndex(p => p.id === piece.id);
                const groupCount = sameLocationPieces.length;
                let offsetX = 0;
                let offsetY = 0;
                if (groupCount > 1) {
                    const radius = 18;
                    const angle = (2 * Math.PI / groupCount) * groupIndex;
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
