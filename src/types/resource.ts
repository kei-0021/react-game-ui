// src/types/resource.ts

import { ResourceId } from './definition.js';

export type Resource = {
  resourceId: ResourceId;
  name: string;
  icon?: string;
  currentValue: number;
  maxValue: number;
  type: 'CONSUMABLE' | 'DURABILITY' | 'ACTION_POINT';
};
