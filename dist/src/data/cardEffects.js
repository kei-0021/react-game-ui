export const cardEffects = {
    "ファイアボール": ({ playerId, addScore }) => {
        console.log(`🔥 ファイアボール発動! by ${playerId}`);
        if (playerId)
            addScore(playerId, 3);
    },
    "ヒーリング": ({ playerId, addScore }) => {
        console.log(`✨ ヒーリング発動! by ${playerId}`);
        if (playerId)
            addScore(playerId, 2);
    },
    "ゴブリン兵": ({ playerId }) => {
        console.log(`🗡️ ゴブリン兵をフィールドに配置! by ${playerId}`);
    },
    "シールド": ({ playerId }) => {
        console.log(`🛡️ シールド展開! by ${playerId}`);
    }
};
