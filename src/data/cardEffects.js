// 各カードの効果をまとめる
export const cardEffects = {
  "ファイアボール": ({ playerId, addScore }) => {
    console.log(`🔥 ファイアボール発動! by ${playerId}`);
    addScore(playerId, 3); // スコア加算
  },
  "ヒーリング": ({ playerId, addScore }) => {
    console.log(`✨ ヒーリング発動! by ${playerId}`);
    addScore(playerId, 2); // 例えば回復ポイントをスコア化
  },
  "ゴブリン兵": ({ playerId }) => {
    console.log(`🗡️ ゴブリン兵をフィールドに配置! by ${playerId}`);
  },
  "シールド": ({ playerId }) => {
    console.log(`🛡️ シールド展開! by ${playerId}`);
  }
};
