import type { PlayerId, ResourceId } from './definition.js';
export type CardEffectParams = {
    playerId?: PlayerId;
    addScore: (playerId: PlayerId, points: number) => void;
    updateResource: (playerId: PlayerId, resourceId: ResourceId, amount: number) => void;
};
//# sourceMappingURL=cardEffectParams.d.ts.map