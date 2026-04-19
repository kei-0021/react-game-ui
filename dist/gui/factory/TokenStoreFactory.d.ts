import { ComponentInfo, ComponentType } from '@/types/component.js';
interface TokenStoreFactoryProps {
    newCompId: string;
    onAdd: (newComponent: ComponentInfo, additionalParams?: any) => void;
    onSuccess: () => void;
    getInitialProps: (type: ComponentType, targetId: string) => any;
}
export declare const TokenStoreFactory: ({ newCompId, onAdd, onSuccess, getInitialProps }: TokenStoreFactoryProps) => import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=TokenStoreFactory.d.ts.map