import { ComponentId } from '@/types/definition.js';
import { ComponentInfo } from '@/types/server.js';
interface ComponentFactoryProps {
    onAdd: (newComponent: ComponentInfo, additionalParams?: any) => void;
    existingIds: ComponentId[];
    containerRef: React.RefObject<HTMLElement | null>;
}
export declare const ComponentFactory: ({ onAdd, existingIds, containerRef }: ComponentFactoryProps) => import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=ComponentFactory.d.ts.map