// src/client-log.js
// クライアント側で表示するログカテゴリを制御
const CLIENT_LOG_CATEGORIES = {
    socket: true,
    component: true,
    card: true,
    playField: true,
    // ... その他必要なカテゴリ
};
export function client_log(tag, ...args) {
    if (!CLIENT_LOG_CATEGORIES[tag])
        return;
    // ブラウザのコンソールに出力
    console.log(`[${tag}]`, ...args);
}
