import { ComponentInfo, ComponentType } from '@/types/component.js';
interface DraggableFactoryProps {
    newCompId: string;
    onAdd: (newComponent: ComponentInfo, additionalParams?: any) => void;
    onSuccess: () => void;
    getInitialProps: (type: ComponentType, targetId: string, overrides: any) => any;
}
export declare const DraggableFactory: ({ newCompId, onAdd, onSuccess, getInitialProps }: DraggableFactoryProps) => import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=DraggableFactory.d.ts.map