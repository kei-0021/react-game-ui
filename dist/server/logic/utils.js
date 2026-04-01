// src/server/logic/utils.ts
/**
 * oldVal に存在しないキーのみ newVal から補完する。
 * 既に値がある場合は、newVal 側の値が何であれ書き換えを行わない。
 */
export const deepFill = (oldVal, newVal, excludeKeys = [], path = '') => {
    // oldVal にあるキーをチェック
    Object.keys(newVal).forEach((key) => {
        // 除外設定（トップレベルのみ）
        if (excludeKeys.includes(key) && path === '')
            return;
        const currentPath = path ? `${path}.${key}` : key;
        const currentOldVal = oldVal[key];
        const currentNewVal = newVal[key];
        // oldVal にキー自体がない場合のみ「追加」
        if (!(key in oldVal)) {
            oldVal[key] = currentNewVal;
            return;
        }
        // 両方がオブジェクトなら、さらに深い階層に「空き」がないか探しに行く
        if (currentOldVal &&
            currentNewVal &&
            typeof currentOldVal === 'object' &&
            typeof currentNewVal === 'object' &&
            !Array.isArray(currentNewVal)) {
            deepFill(currentOldVal, currentNewVal, excludeKeys, currentPath);
        }
    });
};
/**
 * oldVal をベースに newVal の内容で上書き、または結合する。
 */
export const deepMerge = (oldVal, newVal) => {
    const output = { ...oldVal };
    for (const key in newVal) {
        const currentOldVal = oldVal[key];
        const currentNewVal = newVal[key];
        if (currentNewVal instanceof Object && key in oldVal) {
            if (Array.isArray(currentNewVal) && Array.isArray(currentOldVal)) {
                // 配列の場合は結合する
                output[key] = [...currentOldVal, ...currentNewVal];
            }
            else {
                // オブジェクトの場合は再帰的にマージ
                output[key] = deepMerge(currentOldVal, currentNewVal);
            }
        }
        else {
            // oldVal 側にキーがない、またはプリミティブ値の場合は単純代入（上書き）
            output[key] = currentNewVal;
        }
    }
    return output;
};
export const generateColorFromId = (id) => {
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
        hash = (hash << 5) - hash + id.charCodeAt(i);
        hash |= 0;
    }
    const goldenRatioConjugate = 0.618033988749895;
    let hue = (Math.abs(hash) * goldenRatioConjugate) % 1;
    const finalHue = Math.floor(hue * 360);
    return `hsl(${finalHue}, 70%, 50%)`;
};
export const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
};
