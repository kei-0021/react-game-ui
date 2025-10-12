// src/types/resource.ts

// ID のタイプエイリアス
export type ResourceId = string; 

export type Resource = {
  id: ResourceId;
  name: string; // 表示名 (例: '酸素', 'バッテリー')
  icon?: string; // 表示用アイコン (例: '🔋', '💨')
  currentValue: number;
  maxValue: number;
  // 汎用的なリソースの性質を示すタイプ。
  // 'AP' (アクションポイント), 'DURABILITY' (耐久度), 'TIME' (時間制限) などに利用可能。
  type: 'CONSUMABLE' | 'DURABILITY' | 'ACTION_POINT'; 
};