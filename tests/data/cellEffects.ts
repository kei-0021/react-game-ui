type CellEffectParams = {
  playerId?: string;
  addScore: (playerId: string, points: number) => void;
  updateResource: (playerId: string, resourceId: string, amount: number) => void;
};

export const cellEffects: Record<string, (params: CellEffectParams) => void> = {
// 探索者が見つけたレリックタイル (💎)
    "Relic Site": ({ playerId, updateResource }) => {
        // プレイヤーのリソースID 'artifact' に +5 する
        if (playerId) {
            updateResource(playerId, 'artifact', 5);
            console.log(`[EFFECT] ${playerId} が Relic Site に着地し、artifact を +5 獲得。`);
        }
    },
    
    // 資源（エネルギー）が豊富なタイル (🫧)
    "Energy Vein": ({ playerId, updateResource }) => {
        // プレイヤーのリソースID 'OXYGEN' に +2 する
        if (playerId) {
            updateResource(playerId, 'OXYGEN', 20);
            console.log(`🫧 ${playerId} が Energy Vein に着地し、酸素 を 20 回復。`);
        }
    },
    
    // 危険な荒地タイル（🌋） (ペナルティ)
    "Dangerous Zone": ({ playerId, updateResource }) => {
        if (playerId) {
            updateResource(playerId, 'OXYGEN', -100);
            updateResource(playerId, 'BATTERY', -100);
            console.log(`🌋 ${playerId} が Dangerous Zone OXYGEN と BATTERY を -100 損失。`);
        }
    },
    
    // 何も起こらない空のタイル（色分けされた普通のマス）
    "Empty Deep Sea": () => {
        // 効果なし。ログを残すことでデバッグを容易にする
        console.log("🌊 Empty Deep Sea: 海は静かだ");
    },

    // ランドマークタイル (🔱)
    "Abyss Landmark": ({ playerId, addScore }) => {
        if (playerId) {
            addScore(playerId, 10);
            console.log(`[EFFECT] ${playerId} が Abyss Landmark に到達し、スコアを +10 獲得。`);
        }
    }
};