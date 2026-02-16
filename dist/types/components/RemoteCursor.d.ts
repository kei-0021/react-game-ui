import React from "react";
import type { Socket } from "socket.io-client";
import type { PlayerId, RoomId } from "../types/definition.js";
interface Props {
    socket: Socket | null;
    roomId: RoomId | undefined;
    myPlayerId: PlayerId | null;
    players: {
        name: string;
        socketId: string;
        color?: string;
    }[];
    scale: number;
    fixedContainerRef: React.RefObject<HTMLDivElement>;
    visible: boolean;
    isRelative?: boolean;
}
export declare const RemoteCursor: React.MemoExoticComponent<({ socket, roomId, myPlayerId, players, scale, fixedContainerRef, visible, isRelative, }: Props) => import("react/jsx-runtime").JSX.Element | null>;
export {};
