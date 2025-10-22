export type CellEffectParams = {
  playerId?: string;
  addScore: (playerId: string, points: number) => void;
  updateResource: (playerId: string, resourceId: string, amount: number) => void;
};