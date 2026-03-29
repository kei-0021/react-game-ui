import { ComponentId } from '@/types/definition.js';
import { ComponentInfo } from '@/types/server.js';
interface ComponentFactoryProps {
    onAdd: (newComponent: ComponentInfo, additionalParams?: any) => void;
    existingIds: ComponentId[];
}
export declare const ComponentFactory: ({ onAdd, existingIds }: ComponentFactoryProps) => import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=ComponentFactory.d.ts.map