// src/components/Board/GridBoard.tsx
import { CellData, Player } from '@/index.js';
import { BoardId, PlayerId, RoomId, TokenId } from '@/types/definition.js';
import {
  BoardUpdateData,
  TokenMovableRangeData,
  TokenMoveFromBoardData,
  TokenMoveOnBoardData,
  TokenPlayData,
} from '@/types/socketData.js';
import { TokenData } from '@/types/token.js';
import type { DragEvent } from 'react';
import * as React from 'react';
import { Socket } from 'socket.io-client';
import { Token } from '../Token.js';
import boardStyles from './Board.module.css';
import { Cell } from './Cell.js';

type GridLocation = {
  row: number;
  col: number;
};

type GridBoardProps = {
  socket: Socket;
  roomId: RoomId;
  boardId: BoardId;
  players?: Player[];
  myPlayerId: PlayerId | null;
  allowTokenDrag?: boolean;
  moveRange?: number;
  isExact?: boolean;
  width?: number;
  height?: number;
  renderCell: (cellData: CellData, row: number, col: number) => React.ReactNode;
};

/**
 * 盤面（グリッド）を表示し、セルや駒のインタラクション、ドラッグ＆ドロップを管理する
 * @param {Socket} socket - Socket.ioのインスタンス
 * @param {RoomId} roomId - 現在のルームID
 * @param {string} boardId - 描画対象となる盤面の識別子
 * @param {PlayerId} myPlayerId - 操作者自身のプレイヤーID
 * @param {boolean} [allowTokenDrag=false] - トークンのドラッグ操作を許可するかどうか
 * @param {boolean} [moveRange=2] - 駒が移動できるマス数
 * @param {boolean} [isExact=true] - 駒が移動できるマス数がピッタリであるべきかのフラグ
 * @param {number} widht - 横幅
 * @param {number} height - 縦幅
 * @param {(cellData: CellData, row: number, col: number) => React.ReactNode} renderCell - 各マスの内部コンテンツを描画する関数
 */
export function GridBoard({
  socket,
  roomId,
  boardId,
  myPlayerId,
  allowTokenDrag = false,
  moveRange = 2,
  isExact = true,
  width = 800,
  height = 800,
  renderCell,
}: GridBoardProps) {
  const [isBoardReady, setIsBoardReady] = React.useState(false);
  const [cells, setCells] = React.useState<CellData[]>([]);
  const [changedCells, setChangedCells] = React.useState<GridLocation[]>([]);
  const [highlightedCells, setHighlightedCells] = React.useState<GridLocation[]>([]);
  const [draggingTokenId, setDraggingTokenId] = React.useState<TokenId | null>(null);

  const [tokens, setTokens] = React.useState<TokenData[]>([]);
  const [serverExtraTokens, setServerExtraTokens] = React.useState<TokenData[]>([]);

  // IDから盤面の最大行列数を計算（一次元配列対応）
  const rows = cells.length > 0 ? Math.max(...cells.map((c) => parseInt(c.id.match(/r(\d+)/)?.[1] || '0', 10))) + 1 : 0;
  const cols = cells.length > 0 ? Math.max(...cells.map((c) => parseInt(c.id.match(/c(\d+)/)?.[1] || '0', 10))) + 1 : 0;

  const handleCellClick = (celldata: CellData, loc: GridLocation) => {
    console.log('クリックされました');
  };

  const handleCellDoubleClick = (celldata: CellData, loc: GridLocation) => {
    if (!isBoardReady || !socket) return;
    console.log('ダブルクリックされました');
  };

  const handleCellDrop = (e: DragEvent<HTMLDivElement>, targetRow: number, targetCol: number) => {
    e.preventDefault();
    if (!isBoardReady || !socket) return;

    const tokenId = e.dataTransfer.getData('tokenId');
    const source = e.dataTransfer.getData('source');
    const playerId = e.dataTransfer.getData('playerId');

    if (!tokenId) return;

    if (source === 'ScoreBoard') {
      // ScoreBoardからのドロップ
      socket.emit('token:play', {
        roomId,
        boardId,
        tokenId,
        playerId,
        newPosition: { row: targetRow, col: targetCol },
      } as TokenPlayData);
    } else {
      // Board内でのドロップ
      // ドロップ（移動確定）したらハイライトを消す
      setHighlightedCells([]);
      socket.emit('token:move-on-board', {
        roomId,
        boardId,
        tokenId,
        newPosition: { row: targetRow, col: targetCol },
      } as TokenMoveOnBoardData);
    }
  };

  /**
   * トークンクリック時のハンドラ
   * 移動可能範囲を表示するためにサーバーへリクエストを飛ばす
   */
  const requestMovableRange = (tokenId: TokenId) => {
    if (!isBoardReady || !socket) return;

    const targetToken = tokens.find((t) => t.id === tokenId);
    if (!targetToken) return;

    // 持ち主（ownerId）が設定されている場合、自分以外ならリクエストを送らない
    if (targetToken.ownerId && targetToken.ownerId !== myPlayerId) return;

    const requestData: TokenMovableRangeData = {
      roomId,
      boardId,
      tokenId: tokenId,
      moveRange: moveRange,
      isExact: isExact,
    };

    socket.emit('token:movable-range', requestData);
  };

  const handleTokenDragStart = (e: DragEvent<HTMLDivElement>, token: TokenData) => {
    // ドラッグ権限チェック
    if (token.ownerId && token.ownerId !== myPlayerId) {
      e.preventDefault();
      return;
    }

    e.dataTransfer.setData('tokenId', token.id);
    e.dataTransfer.effectAllowed = 'move';
    setDraggingTokenId(token.id);
    requestMovableRange(token.id);
  };

  const handleTokenDragEnd = () => {
    setDraggingTokenId(null);
  };

  /**
   * トークンをダブルクリックした際のハンドラ
   * 盤面から取り除き、手札等のサーバー管理領域に戻すリクエストを送信
   */
  const handleTokenDoubleClick = (tokenId: TokenId) => {
    if (!isBoardReady || !socket) return;

    const targetToken = tokens.find((p) => p.id === tokenId);
    if (!targetToken) return;

    if (targetToken.ownerId && targetToken.ownerId !== myPlayerId) return;

    const requestData: TokenMoveFromBoardData = {
      roomId,
      boardId,
      tokenId: tokenId,
    };

    socket.emit('token:move-from-board', requestData);
  };

  // ------------------- Socket Effects -------------------

  // 盤面初期化/更新
  React.useEffect(() => {
    const handleInitBoard = (data: BoardUpdateData) => {
      if (data.board && data.board.length > 0) {
        setCells(data.board);
        setIsBoardReady(true);
      }
      if (data.boardTokens) {
        setServerExtraTokens(data.boardTokens);
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
      setChangedCells(updatedLocs);
    };
    socket.on('cell:update', handleCellUpdate);
    return () => {
      socket.off('cell:update', handleCellUpdate);
    };
  }, [socket]);

  // プレイヤー情報を描画用の駒データに変換
  React.useEffect(() => {
    // playersからmapするのではなく、サーバーから来た駒リストをそのままセット
    const safeTokens = Array.isArray(serverExtraTokens) ? serverExtraTokens : [];
    setTokens(safeTokens);
  }, [serverExtraTokens]);

  const boardStyle: React.CSSProperties = {
    '--board-rows': rows,
    '--board-cols': cols,
    display: 'grid',
    gridTemplateRows: `repeat(${rows}, 1fr)`,
    gridTemplateColumns: `repeat(${cols}, 1fr)`,
    gap: '4px',
    width: width,
    height: height,
    position: 'relative',
  } as React.CSSProperties;

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
    <div className={boardStyles.boardContainer} style={boardStyle}>
      {/* マス目のレンダリング */}
      {cells.map((cell) => {
        const match = cell.id.match(/r(\d+)c(\d+)/);
        const r = match ? parseInt(match[1], 10) : 0;
        const c = match ? parseInt(match[2], 10) : 0;

        const isChanged = changedCells.some((loc) => loc.row === r && loc.col === c);

        const isHighlighted =
          tokens.find((p) => p.id === draggingTokenId)?.movableCells?.some((loc) => loc.row === r && loc.col === c) ??
          false;

        const cellDataForRenderer: CellData = {
          ...cell,
          content: isChanged ? cell.changedContent : cell.content,
        };

        const loc: GridLocation = { row: r, col: c };

        return (
          <Cell<GridLocation>
            key={cell.id}
            locationData={{ row: r, col: c }}
            cellData={cellDataForRenderer}
            onClick={() => handleCellClick(cell, { row: r, col: c })}
            onDoubleClick={() => handleCellDoubleClick(cell, loc)}
            onDrop={(e) => handleCellDrop(e, r, c)}
            onDragOver={(e) => e.preventDefault()}
            highlighted={isHighlighted && !!draggingTokenId}
            changed={isChanged}
          >
            {renderCell(cellDataForRenderer, r, c)}
          </Cell>
        );
      })}

      {/* コマのレンダリング */}
      {tokens.map((token) => {
        const pos = (token as any).position;
        if (!pos) return null;

        const sameLocationTokens = tokens.filter((p) => {
          const pPos = (p as any).position;
          return pPos && pPos.row === pos.row && pPos.col === pos.col;
        });

        const groupIndex = sameLocationTokens.findIndex((p) => p.id === token.id);
        const groupCount = sameLocationTokens.length;

        let offsetX = 0;
        let offsetY = 0;

        if (groupCount > 1) {
          const radius = 18;
          const angle = ((2 * Math.PI) / groupCount) * groupIndex;
          offsetX = radius * Math.cos(angle);
          offsetY = radius * Math.sin(angle);
        }

        const tokenStyle: React.CSSProperties = {
          // 確定した座標 pos を使用
          gridArea: `${pos.row + 1} / ${pos.col + 1} / span 1 / span 1`,
          alignSelf: 'center',
          justifySelf: 'center',
          transform: `translate(${offsetX}px, ${offsetY}px)`,
          transition: 'transform 0.3s ease-in-out',
          pointerEvents: draggingTokenId && draggingTokenId !== token.id ? 'none' : 'auto',
        };

        return (
          <Token
            key={token.id}
            token={token}
            style={tokenStyle}
            isFilled={true}
            onClick={requestMovableRange}
            onDoubleClick={() => handleTokenDoubleClick(token.id)}
            isDraggable={allowTokenDrag}
            onDragStart={handleTokenDragStart}
            onDragEnd={handleTokenDragEnd}
          />
        );
      })}
    </div>
  );
}
