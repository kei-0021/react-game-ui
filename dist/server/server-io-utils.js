// src/server/server-io-utils.ts
import fs from 'node:fs';
// --- 型バリデーター関数群 ---
export const Validators = {
    isCardArray: (data) => {
        if (!Array.isArray(data))
            throw new Error('Data is not an array');
        return data.every((item, index) => {
            const id = item?.id || `Index:${index}`;
            // 最低限の必須項目チェック
            if (!('id' in item))
                throw new Error(`[Card:${id}] 'id' is missing`);
            if (!('name' in item))
                throw new Error(`[Card:${id}] 'name' is missing`);
            // 各項目の個別バリデーション
            if (item.deckId !== undefined && typeof item.deckId !== 'string') {
                throw new Error(`[Card:${id}] 'deckId' must be a string`);
            }
            if (item.description !== undefined && typeof item.description !== 'string') {
                throw new Error(`[Card:${id}] 'description' must be a string`);
            }
            if (item.location !== undefined && typeof item.location !== 'string') {
                throw new Error(`[Card:${id}] 'location' must be a string`);
            }
            if (item.isFaceUp !== undefined && typeof item.isFaceUp !== 'boolean') {
                throw new Error(`[Card:${id}] 'isFaceUp' must be a boolean`);
            }
            if (item.backColor !== undefined && typeof item.backColor !== 'string') {
                throw new Error(`[Card:${id}] 'backColor' must be a string`);
            }
            if (item.drawCondition !== undefined) {
                if (!Array.isArray(item.drawCondition)) {
                    throw new Error(`[Card:${id}] 'drawCondition' must be an array`);
                }
                if (item.drawCondition.length !== 2) {
                    throw new Error(`[Card:${id}] 'drawCondition' must have 2 elements`);
                }
            }
            return true;
        });
    },
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
 * 同じカードやトークンの数を増やすのに使用する
 */
const replicateData = (data, numSets) => {
    return Array.from({ length: numSets }).flatMap((_, i) => data.map((item) => ({ ...item, id: `${item.id}-s${i + 1}` })));
};
/**
 * テンプレート配列と個数設定から、フラットな配置用配列を作る
 */
const generateFromTemplates = (templates, counts) => {
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
const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
};
/**
 * プリセット準備の関数群
 */
export class SetupHelper {
    /**
     * カードデータのバリデーション
     */
    assertCards(data) {
        if (Validators.isCardArray(data))
            return data;
        throw new Error('Invalid card data');
    }
    /**
     * カードに共通のプロパティ（location, drawConditionなど）をセットする
     */
    initializeCards(cards, defaults) {
        return cards.map((card) => ({
            ...card,
            ...defaults,
        }));
    }
    /**
     * カードの複製（ユニーク化）
     */
    createUniqueCards(cards, numSets) {
        return replicateData(cards, numSets);
    }
    /**
     * トークンストアの生成。共通情報の初期化も可能。
     * @param tokens - 入力トークンデータ
     * @param count - トークン置き場に置くトークンの数
     * @param imageSrc - トークンの画像URL（省略可能）
     * @param color - トークンの背景用のカラーコード（省略可能）
     * @returns トークン置き場
     */
    createTokenStore(tokens, count, imageSrc, color) {
        const replicatedTokens = replicateData(tokens, count);
        if (imageSrc) {
            replicatedTokens.forEach((token) => {
                token.imageSrc = imageSrc;
            });
        }
        if (color) {
            replicatedTokens.forEach((token) => {
                token.color = color;
            });
        }
        return replicatedTokens;
    }
    /**
     * グリッド状ボードレイアウトの生成
     */
    createGridBoardLayout(base, counts, rows, cols, isRandom = false) {
        const effectiveCols = cols ?? rows;
        const expectedTotal = rows * effectiveCols;
        const actualTotal = Object.values(counts).reduce((sum, count) => sum + count, 0);
        if (actualTotal !== expectedTotal) {
            throw new Error(`[Grid Error] Size:${rows}x${effectiveCols}(${expectedTotal}) != Total:${actualTotal}`);
        }
        let templates = generateFromTemplates(base, counts);
        // ランダム配置が有効な場合はシャッフル
        if (isRandom) {
            templates = shuffleArray(templates);
        }
        // セルを配置して基本データを作る
        const grid = [];
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < effectiveCols; c++) {
                const template = templates[r * effectiveCols + c];
                grid.push({
                    ...template,
                    id: `r${r}c${c}`,
                    adjacentCellIds: [],
                });
            }
        }
        // 隣接セルIDを計算して流し込む
        grid.forEach((cell) => {
            const match = cell.id.match(/r(\d+)c(\d+)/);
            if (!match)
                return;
            const r = parseInt(match[1], 10);
            const c = parseInt(match[2], 10);
            const adjacents = [];
            // 上下左右の相対座標
            const directions = [
                { dr: -1, dc: 0 }, // 上
                { dr: 1, dc: 0 }, // 下
                { dr: 0, dc: -1 }, // 左
                { dr: 0, dc: 1 }, // 右
            ];
            directions.forEach(({ dr, dc }) => {
                const nr = r + dr;
                const nc = c + dc;
                // 盤面内かチェック
                if (nr >= 0 && nr < rows && nc >= 0 && nc < effectiveCols) {
                    adjacents.push(`r${nr}c${nc}`);
                }
            });
            cell.adjacentCellIds = adjacents;
        });
        return grid;
    }
}
