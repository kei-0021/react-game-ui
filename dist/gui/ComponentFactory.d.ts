import { GameParam } from '@/index.js';
import { ComponentInfo } from '@/types/component.js';
import { ComponentId } from '@/types/definition.js';
interface ComponentFactoryProps {
    onAdd: (newComponent: ComponentInfo, additionalParams?: any) => void;
    onDelete: (compId: ComponentId, additionalParams?: any) => void;
    existingComponents: ComponentInfo[];
    fullGameParam?: GameParam;
    containerRef: React.RefObject<HTMLElement | null>;
}
export declare const ComponentFactory: ({ onAdd, onDelete, existingComponents, fullGameParam }: ComponentFactoryProps) => import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=ComponentFactory.d.ts.map