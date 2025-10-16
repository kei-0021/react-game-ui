export const cardEffects = {
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
  "緊急流量補給": ({ updateResource }) => {
    console.log(`🫧 緊急流量補給"!`);
    updateResource("OXYGEN", 10);
  },
  "緊急酸素補給": ({ updateResource }) => {
    console.log(`🏥 緊急酸素補給"!`);
    updateResource("OXYGEN", 20);
  },
  "探索": ({ updateResource }) => {
    console.log(`🔍 探索"!`);
    updateResource("BATTERY", -1);
  },
  "ソナー＆チャージ": ({ updateResource }) => {
    console.log(`🔋⚡️ ソナー＆チャージ"!`);
    updateResource("BATTERY", 2);
  },
};
