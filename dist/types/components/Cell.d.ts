import * as React from 'react';
import type { CellId } from "../types/definition.js";
export type CellData = {
    id: CellId;
    shapeType: string;
    backgroundColor: string;
    changedColor: string;
    content: string;
    changedContent: string;
    customClip?: string;
    [key: string]: any;
};
type CellProps<TLocation> = {
    locationData: TLocation;
    cellData: CellData;
    changed: boolean;
    onClick: (loc: TLocation) => void;
    onDoubleClick: (loc: TLocation) => void;
    children: React.ReactNode;
    onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
    onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
};
export declare const Cell: <TLocation>({ locationData, cellData, onClick, onDoubleClick, children, onDrop, onDragOver, changed }: React.PropsWithChildren<CellProps<TLocation>>) => import("react/jsx-runtime").JSX.Element;
export {};
