import { ComponentId } from '@/types/definition.js';
import { ComponentInfo, GameParam } from '@/types/server.js';
interface ComponentFactoryProps {
    onAdd: (newComponent: ComponentInfo, additionalParams?: any) => void;
    onDelete: (compId: ComponentId, additionalParams?: any) => void;
    existingComponents: ComponentInfo[];
    fullGameParam?: GameParam;
    containerRef: React.RefObject<HTMLElement | null>;
}
export declare const ComponentFactory: ({ onAdd, onDelete, existingComponents, fullGameParam, containerRef, }: ComponentFactoryProps) => import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=ComponentFactory.d.ts.map