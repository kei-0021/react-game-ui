import { CellEffectParams } from "../../src/types/cellEffectParams";

export const cellEffects: Record<string, (params: CellEffectParams) => void> = {
// 探索者が見つけたレリックタイル (💎)
    "Relic Site": ({ playerId, updateResource }) => {
        // プレイヤーのリソースID 'artifact' に +1 する
        if (playerId) {
            updateResource(playerId, 'ARTIFACT', 1);
            console.log(`[EFFECT] ${playerId} が Relic Site に着地し、artifact を +1 獲得。`);
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
    "Abyss Landmark": ({ playerId, updateResource }) => {
        if (playerId) {
            updateResource(playerId, 'ARTIFACT', 5);
            console.log(`[EFFECT] ${playerId} が Abyss Landmark に到達し、artifact を +5 獲得。`);
        }
    }
};