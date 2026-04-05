// src/server/logger.ts
const LOG_LEVEL_PRIORITY = {
    DEBUG: 0,
    INFO: 1,
    WARN: 2,
    ERROR: 3,
};
export let CURRENT_LOG_LEVEL = 'DEBUG';
export const setLogLevel = (level) => {
    CURRENT_LOG_LEVEL = level;
};
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
/**
 * サーバー全体のログを出力する共通関数
 * @param tag カテゴリ
 * @param gameId ゲームID (任意)
 * @param roomId ルームID (任意)
 * @param msg メッセージ内容
 * @param level ログレベル (デフォルト: INFO)
 */
export const server_log = (tag, gameId, roomId, msg, level = 'INFO') => {
    if (!(tag in LOG_CATEGORIES)) {
        throw new Error(`未定義のログカテゴリです: ${tag}`);
    }
    if (LOG_LEVEL_PRIORITY[level] < LOG_LEVEL_PRIORITY[CURRENT_LOG_LEVEL]) {
        return;
    }
    if (!LOG_CATEGORIES[tag]) {
        return;
    }
    const time = new Intl.DateTimeFormat('ja-JP', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
        timeZone: 'Asia/Tokyo',
    }).format(new Date());
    const gDisplay = gameId || 'SYSTEM';
    const rDisplay = roomId || 'GLOBAL';
    const header = `[${time}] [${level}] [${tag}] [${gDisplay} (${rDisplay})]`;
    const formattedLog = `${header} ${msg}`;
    switch (level) {
        case 'ERROR':
            console.error(formattedLog);
            break;
        case 'WARN':
            console.warn(formattedLog);
            break;
        default:
            console.log(formattedLog);
            break;
    }
};
