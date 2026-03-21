import { CellData, Player } from '@/index.js';
import { BoardId, PlayerId, RoomId } from '@/types/definition.js';
import * as React from 'react';
import { Socket } from 'socket.io-client';
type GridBoardProps = {
    socket: Socket;
    roomId: RoomId;
    boardId: BoardId;
    players?: Player[];
    myPlayerId: PlayerId | null;
    allowPieceDrag?: boolean;
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
 * @param {Player[]} players - ルームに参加しているプレイヤーのリスト。指定するとプレーヤーに対応するコマを生成する
 * @param {PlayerId} myPlayerId - 操作者自身のプレイヤーID
 * @param {boolean} [allowPieceDrag=false] - 駒のドラッグ操作を許可するかどうか
 * @param {boolean} [moveRange=2] - 駒が移動できるマス数
 * @param {boolean} [isExact=true] - 駒が移動できるマス数がピッタリであるべきかのフラグ
 * @param {number} widht - 横幅
 * @param {number} height - 縦幅
 * @param {(cellData: CellData, row: number, col: number) => React.ReactNode} renderCell - 各マスの内部コンテンツを描画する関数
 */
export declare function GridBoard({ socket, roomId, boardId, players, myPlayerId, allowPieceDrag, moveRange, isExact, width, height, renderCell, }: GridBoardProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=GridBoard.d.ts.map