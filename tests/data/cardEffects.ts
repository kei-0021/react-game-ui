type CardEffectParams = {
  playerId?: string;
  addScore: (playerId: string, points: number) => void;
  updateResource: (playerId: string, resourceId: string, amount: number) => void;
};

export const cardEffects: Record<string, (params: CardEffectParams) => void> = {
  "ファイアボール": ({ playerId, addScore }) => {
    console.log(`🔥 ファイアボール発動! by ${playerId}`);
    if (playerId) addScore(playerId, 3);
  },
  "ヒーリング": ({ playerId, updateResource }) => {
    console.log(`✨ ヒーリング発動! by ${playerId}`);
    if (playerId) updateResource(playerId, "OXYGEN", 30);
  },
  "ゴブリン兵": ({ playerId, updateResource }) => {
    console.log(`🗡️ ゴブリン兵をフィールドに配置! by ${playerId}`);
    if (playerId) updateResource(playerId, "OXYGEN", -40);
  },
  "シールド": ({ playerId }) => {
    console.log(`🛡️ シールド展開! by ${playerId}`);
  }
};
