import { ComponentInfo, ComponentType } from '@/types/component.js';
interface ScoreBoardFactoryProps {
    newCompId: string;
    onAdd: (newComponent: ComponentInfo) => void;
    onSuccess: () => void;
    getInitialProps: (type: ComponentType, targetId: string, overrides: any) => any;
}
export declare const ScoreBoardFactory: ({ newCompId, onAdd, onSuccess, getInitialProps }: ScoreBoardFactoryProps) => import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=ScoreBoardFactory.d.ts.map