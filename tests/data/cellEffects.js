export const cellEffects = {
  // 探索者が見つけたレリックタイル (💎)
  'Relic Site 1': ({ playerId }) => {
    // 💡 requirePopup を追加
    if (playerId) {
      console.log(`[EFFECT] ${playerId} が Relic Site に着地し、artifact を +1 獲得。`);
    }
  },
  'Relic Site 2': ({ playerId }) => {
    // 💡 requirePopup を追加
    if (playerId) {
      console.log(`[EFFECT] ${playerId} が Relic Site に着地し、artifact を +1 獲得。`);
    }
  },

  // 資源（エネルギー）が豊富なタイル (🫧)
  'Energy Vein': ({ playerId, updateResource }) => {
    // 💡 requirePopup を追加
    // プレイヤーのリソースID 'OXYGEN' に +20 する
    if (playerId) {
      updateResource(playerId, 'OXYGEN', 20);
      console.log(`🫧 ${playerId} が Energy Vein に着地し、酸素 を 20 回復。`);
    }
  },

  // 危険な荒地タイル（🌋） (ペナルティ)
  'Dangerous Zone': ({ playerId, updateResource }) => {
    // 💡 requirePopup を追加
    if (playerId) {
      updateResource(playerId, 'OXYGEN', -100);
      updateResource(playerId, 'BATTERY', -100);
      console.log(`🌋 ${playerId} が Dangerous Zone OXYGEN と BATTERY を -100 損失。`);
    }
  },

  // 何も起こらない空のタイル（色分けされた普通のマス）
  'Empty Deep Sea': ({}) => {
    // 💡 requirePopup を追加
    console.log('🌊 Empty Deep Sea: 海は静かだ');
  },

  // ランドマークタイル (🔱)
  'Abyss Landmark': ({ playerId }) => {
    // 💡 requirePopup を追加
    if (playerId) {
      console.log(`[EFFECT] ${playerId} が Abyss Landmark に到達し、artifact を +5 獲得。`);
    }
  },
};
