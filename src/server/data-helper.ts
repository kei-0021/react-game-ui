// src/server/data-helper.ts

/**
 * 指定した枚数分、IDをユニークにしながらデータを複製する
 * デッキのセット数を増やしたい時に便利
 */
export const replicateData = <T extends { id: string }>(data: T[], numSets: number): T[] => {
  return Array.from({ length: numSets }).flatMap((_, i) =>
    data.map((item) => ({ ...item, id: `${item.id}-s${i + 1}` })),
  );
};

/**
 * テンプレート配列と個数設定から、フラットな配置用配列を作る
 */
export const generateFromTemplates = <T extends { templateId: string }>(
  templates: T[],
  counts: Record<string, number>,
): T[] => {
  const templateMap = templates.reduce(
    (map, t) => {
      map[t.templateId] = t;
      return map;
    },
    {} as Record<string, T>,
  );

  return Object.entries(counts).flatMap(([templateId, count]) => {
    const template = templateMap[templateId];
    if (!template) return [];
    return Array.from({ length: count }, (_, i) => ({
      ...template,
      id: `${templateId}-${i + 1}`,
    }));
  });
};

/**
 * 1次元配列を2次元（ボード形式）に変換する
 */
export const chunkTo2D = <T>(array: T[], cols: number): T[][] => {
  const rows: T[][] = [];
  for (let i = 0; i < array.length; i += cols) {
    rows.push(array.slice(i, i + cols));
  }
  return rows;
};
