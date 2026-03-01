import type { Card } from './card.js';
import type { PlayerId } from './definition.js';
import { Position } from './position.js';
import type { Resource } from './resource.js';
import type { Token } from './token.js';
export type Player = {
    id: PlayerId;
    name: string;
    color: string;
    score?: number;
    cards?: Card[];
    tokens?: Token[];
    resources?: Resource[];
    socketId: string;
    position: Position;
};
//# sourceMappingURL=player.d.ts.map