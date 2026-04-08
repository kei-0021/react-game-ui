import { ComponentId, GameId } from './definition.js';
/**
 * 利用可能なコンポーネントの種類一覧
 */
export declare const COMPONENT_TYPES: readonly ["Deck", "PlayField", "ScoreBoard", "TokenStore", "GridBoard", "Draggable", "Dice", "Timer", "SystemMessageWindow"];
/**
 * 利用可能なコンポーネントの種類一覧 (型)
 */
export type ComponentType = (typeof COMPONENT_TYPES)[number];
/**
 * コンポーネントに渡すpropsを格納する型
 */
export type ComponentInfo = {
    id: ComponentId;
    type: ComponentType;
    props: Record<string, any>;
};
export type { GameId };
//# sourceMappingURL=component.d.ts.map