import { PieceId } from './definition.js';
export type PieceData = {
    id: PieceId;
    name: string;
    color: string;
    image?: string;
    location: {
        row: number;
        col: number;
    };
};
//# sourceMappingURL=piece.d.ts.map