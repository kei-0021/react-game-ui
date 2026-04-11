import type { PieceId, PlayerId } from './definition.js';
import type { Position } from './position.js';
export type PieceData = {
    id: PieceId;
    ownerId: PlayerId | null;
    name: string;
    color: string;
    image?: string;
    position: Position;
    movableCells: any[];
};
//# sourceMappingURL=piece.d.ts.map