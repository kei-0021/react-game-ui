// src/server/server-io-utils.ts
import fs from 'node:fs';
// --- 型バリデーター関数群 ---
export const Validators = {
    isCardArray: (data) => Array.isArray(data) && data.every((item) => 'id' in item && 'name' in item),
    isResourceArray: (data) => Array.isArray(data) && data.every((item) => 'resourceId' in item && 'currentValue' in item),
    isCellArray: (data) => Array.isArray(data) && data.every((item) => 'templateId' in item),
};
/**
 * 内部でバリデーションまで完結させる JSON ローダー
 */
export function loadJsonAssert(relativePath, validator) {
    if (!fs.existsSync(relativePath)) {
        throw new Error(`[File Not Found] 読み込み失敗: ${relativePath}`);
    }
    const raw = fs.readFileSync(relativePath, 'utf-8');
    const parsed = JSON.parse(raw);
    if (!validator(parsed)) {
        throw new Error(`[Type Mismatch] JSONの構造が一致しません: ${relativePath}`);
    }
    return parsed;
}
/**
 * 指定した枚数分、IDをユニークにしながらデータを複製する
 * デッキのセット数を増やしたい時に便利
 */
export const replicateData = (data, numSets) => {
    return Array.from({ length: numSets }).flatMap((_, i) => data.map((item) => ({ ...item, id: `${item.id}-s${i + 1}` })));
};
/**
 * テンプレート配列と個数設定から、フラットな配置用配列を作る
 */
export const generateFromTemplates = (templates, counts) => {
    const templateMap = templates.reduce((map, t) => {
        map[t.templateId] = t;
        return map;
    }, {});
    return Object.entries(counts).flatMap(([templateId, count]) => {
        const template = templateMap[templateId];
        if (!template)
            return [];
        return Array.from({ length: count }, (_, i) => ({
            ...template,
            id: `${templateId}-${i + 1}`,
        }));
    });
};
/**
 * 1次元配列を2次元（ボード形式）に変換する
 */
export const chunkTo2D = (array, cols) => {
    const rows = [];
    for (let i = 0; i < array.length; i += cols) {
        rows.push(array.slice(i, i + cols));
    }
    return rows;
};
