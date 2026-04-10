import { ComponentInfo, ComponentType } from '@/types/component.js';
interface DiceFactoryProps {
    newCompId: string;
    onAdd: (newComponent: ComponentInfo) => void;
    onSuccess: () => void;
    getInitialProps: (type: ComponentType, targetId: string, sides: number) => any;
}
export declare const DiceFactory: ({ newCompId, onAdd, onSuccess, getInitialProps }: DiceFactoryProps) => import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=DiceFactory.d.ts.map