import * as React from 'react';
type CellProps = {
    row: number;
    col: number;
    cellData: {
        backgroundColor: string;
        changedColor: string;
    };
    onClick: (row: number, col: number) => void;
    onDoubleClick: (row: number, col: number) => void;
    children: React.ReactNode;
    onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
    onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
    changed: boolean;
};
export default function Cell({ row, col, cellData, onClick, onDoubleClick, // ⭐ [修正点 2] propsとして受け取る
children, onDrop, onDragOver, changed }: CellProps): import("react/jsx-runtime").JSX.Element;
export {};
