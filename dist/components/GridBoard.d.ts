import { Player } from '@/index.js';
import { BoardId, PlayerId, RoomId } from '@/types/definition.js';
import * as React from 'react';
import { Socket } from 'socket.io-client';
import { CellData } from './Cell.js';
type GridBoardProps = {
    socket: Socket;
    roomId: RoomId;
    boardId: BoardId;
    players?: Player[];
    myPlayerId: PlayerId | null;
    allowPieceDrag?: boolean;
    renderCell: (cellData: CellData, row: number, col: number) => React.ReactNode;
    width?: number;
    height?: number;
};
/**
 * 盤面（グリッド）を表示し、セルや駒のインタラクション、ドラッグ＆ドロップを管理する
 * @param {Socket} socket - Socket.ioのインスタンス
 * @param {RoomId} roomId - 現在のルームID
 * @param {string} boardId - 描画対象となる盤面の識別子
 * @param {Player[]} players - ルームに参加しているプレイヤーのリスト
 * @param {PlayerId} myPlayerId - 操作者自身のプレイヤーID
 * @param {boolean} [allowPieceDrag=false] - 駒のドラッグ操作を許可するかどうか
 * @param {(cellData: CellData, row: number, col: number) => React.ReactNode} renderCell - 各マスの内部コンテンツを描画する関数
 * @param {number} widht - 横幅
 * @param {number} height - 縦幅
 */
export declare function GridBoard({ socket, roomId, boardId, players, myPlayerId, renderCell, allowPieceDrag, width, height, }: GridBoardProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=GridBoard.d.ts.map