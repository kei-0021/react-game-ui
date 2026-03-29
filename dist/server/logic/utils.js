/**
 * target に存在しないキーのみ source から補完する。
 * 既に値がある場合は、source 側の値が何であれ書き換えを行わない。
 */
export const deepFill = (target, source, excludeKeys = [], path = '') => {
    // source にあるキーをチェック
    Object.keys(source).forEach((key) => {
        // 除外設定（トップレベルのみ）
        if (excludeKeys.includes(key) && path === '')
            return;
        const currentPath = path ? `${path}.${key}` : key;
        const targetVal = target[key];
        const sourceVal = source[key];
        // target にキー自体がない場合のみ「追加」
        if (!(key in target)) {
            target[key] = sourceVal;
            return;
        }
        // 両方がオブジェクトなら、さらに深い階層に「空き」がないか探しに行く
        if (targetVal &&
            sourceVal &&
            typeof targetVal === 'object' &&
            typeof sourceVal === 'object' &&
            !Array.isArray(sourceVal)) {
            deepFill(targetVal, sourceVal, excludeKeys, currentPath);
        }
        else {
        }
    });
};
export const deepMerge = (target, source) => {
    const output = { ...target };
    for (const key in source) {
        if (source[key] instanceof Object && key in target) {
            if (Array.isArray(source[key]) && Array.isArray(target[key])) {
                // 配列の場合は結合する
                output[key] = [...target[key], ...source[key]];
            }
            else {
                // オブジェクトの場合は再帰的にマージ
                output[key] = deepMerge(target[key], source[key]);
            }
        }
        else {
            // ターゲット側にキーがない、またはプリミティブ値の場合は単純代入
            output[key] = source[key];
        }
    }
    return output;
};
