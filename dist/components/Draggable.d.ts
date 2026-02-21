import { PieceId, RoomId } from "@/types/definition.js";
import type { CSSProperties, ReactNode } from "react";
import type { Socket } from "socket.io-client";
interface GridBounds {
    left: number;
    top: number;
    right: number;
    bottom: number;
    cellSize: number;
}
interface DraggableProps {
    image?: string;
    mask?: boolean;
    initialX?: number;
    initialY?: number;
    size?: number;
    color?: string;
    isTransparent?: boolean;
    children?: ReactNode;
    style?: CSSProperties;
    socket?: Socket;
    roomId?: RoomId;
    pieceId?: PieceId;
    onDragEnd?: (x: number, y: number) => void;
    gridBounds?: GridBounds;
    scale?: number;
    containerRef?: React.RefObject<HTMLElement | null>;
}
export declare function Draggable({ image, mask, initialX, initialY, size, color, isTransparent, children, style, socket, roomId, pieceId, onDragEnd, scale, containerRef, }: DraggableProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=Draggable.d.ts.map