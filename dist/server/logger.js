// src/server/logger.ts
export let LOG_CATEGORIES = {
    connection: true,
    lobby: true,
    game: true,
    room: true,
    deck: true,
    card: true,
    cell: true,
    dice: true,
    timer: true,
    addScore: true,
    resource: true,
    token: true,
    draggable: true,
    warn: true,
    popup: true,
    custom_event: true,
    disconnect: true,
};
const ANSI_RED = '\x1b[31m';
const ANSI_RESET = '\x1b[0m';
/**
 * サーバー全体のログを出力する共通関数
 * @param tag カテゴリ
 * @param gameId ゲームID (任意)
 * @param roomId ルームID (任意)
 * @param msg メッセージ内容 (最後)
 */
export const server_log = (tag, gameId, roomId, msg) => {
    if (!(tag in LOG_CATEGORIES)) {
        throw new Error(`未定義のログカテゴリです: ${tag}`);
    }
    // カテゴリ別ログ設定を見て無効になっている場合、ログを出さないようにする
    if (!LOG_CATEGORIES[tag])
        return;
    // 日本時間 (JST) で [HH:mm:ss] を生成
    const time = new Intl.DateTimeFormat('ja-JP', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
        timeZone: 'Asia/Tokyo',
    }).format(new Date());
    const gDisplay = gameId || 'SYSTEM';
    const rDisplay = roomId || 'GLOBAL';
    const header = `[${time}] [${tag}] [${gDisplay} (${rDisplay})]`;
    if (tag === 'warn') {
        console.warn(`${ANSI_RED}${header}${ANSI_RESET} ${msg}`);
    }
    else {
        console.log(`${header} ${msg}`);
    }
};
