// src/server/logic/utils.ts

/**
 * target に存在しないキーのみ source から補完する。
 * 既に値がある場合は、source 側の値が何であれ書き換えを行わない。
 */
export const deepFill = (target: any, source: any, excludeKeys: string[] = [], path: string = '') => {
  // source にあるキーをチェック
  Object.keys(source).forEach((key) => {
    // 除外設定（トップレベルのみ）
    if (excludeKeys.includes(key) && path === '') return;

    const currentPath = path ? `${path}.${key}` : key;
    const targetVal = target[key];
    const sourceVal = source[key];

    // target にキー自体がない場合のみ「追加」
    if (!(key in target)) {
      target[key] = sourceVal;
      return;
    }

    // 両方がオブジェクトなら、さらに深い階層に「空き」がないか探しに行く
    if (
      targetVal &&
      sourceVal &&
      typeof targetVal === 'object' &&
      typeof sourceVal === 'object' &&
      !Array.isArray(sourceVal)
    ) {
      deepFill(targetVal, sourceVal, excludeKeys, currentPath);
    } else {
    }
  });
};

export const deepMerge = (target: any, source: any) => {
  const output = { ...target };

  for (const key in source) {
    if (source[key] instanceof Object && key in target) {
      if (Array.isArray(source[key]) && Array.isArray(target[key])) {
        // 配列の場合は結合する
        output[key] = [...target[key], ...source[key]];
      } else {
        // オブジェクトの場合は再帰的にマージ
        output[key] = deepMerge(target[key], source[key]);
      }
    } else {
      // ターゲット側にキーがない、またはプリミティブ値の場合は単純代入
      output[key] = source[key];
    }
  }
  return output;
};

export const generateColorFromId = (id: string): string => {
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

export const shuffleArray = <T>(array: T[]): T[] => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};
