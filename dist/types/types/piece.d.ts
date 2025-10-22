import { PieceId } from "./definition.js";
export type PieceData = {
    id: PieceId;
    name: string;
    color: string;
    location: {
        row: number;
        col: number;
    };
};
