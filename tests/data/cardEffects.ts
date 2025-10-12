type CardEffectParams = {
  playerId?: string;
  addScore: (playerId: string, points: number) => void;
  updateResource: (playerId: string, resourceId: string, amount: number) => void;
};

export const cardEffects: Record<string, (params: CardEffectParams) => void> = {
  // "ファイアボール": ({ playerId, addScore }) => {
  //   console.log(`🔥 ファイアボール発動! by ${playerId}`);
  //   if (playerId) addScore(playerId, 3);
  // },
  // "ヒーリング": ({ playerId, updateResource }) => {
  //   console.log(`✨ ヒーリング発動! by ${playerId}`);
  //   if (playerId) updateResource(playerId, "HP", 30);
  // },
  // "ゴブリン兵": ({ playerId, updateResource }) => {
  //   console.log(`🗡️ ゴブリン兵をフィールドに配置! by ${playerId}`);
  //   if (playerId) updateResource(playerId, "OXYGEN", -40);
  // },
  // "シールド": ({ playerId }) => {
  //   console.log(`🛡️ シールド展開! by ${playerId}`);
  // },
  "緊急流量補給": ({ playerId, updateResource }) => {
    console.log(`🫧 緊急流量補給"! by ${playerId}`);
    if (playerId) updateResource(playerId, "OXYGEN", 10);
  },
  "緊急酸素補給": ({ playerId, updateResource }) => {
    console.log(`🏥 緊急酸素補給"! by ${playerId}`);
    if (playerId) updateResource(playerId, "OXYGEN", 20);
  },
  "バッテリー充電": ({ playerId, updateResource }) => {
    console.log(`🔋 バッテリー充電"! by ${playerId}`);
    if (playerId) updateResource(playerId, "BATTERY", 5);
  },
  "バッテリー過負荷": ({ playerId, updateResource }) => {
    console.log(`🔋⚡️ バッテリー過負荷"! by ${playerId}`);
    if (playerId) updateResource(playerId, "BATTERY", -10);
  },
};
