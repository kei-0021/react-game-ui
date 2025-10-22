import { ResourceId } from "./definition.js";
export type Resource = {
    id: ResourceId;
    name: string;
    icon?: string;
    currentValue: number;
    maxValue: number;
    type: 'CONSUMABLE' | 'DURABILITY' | 'ACTION_POINT';
};
