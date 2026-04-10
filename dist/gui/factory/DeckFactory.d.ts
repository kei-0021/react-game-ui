import { GameParam } from '@/index.js';
import { ComponentInfo } from '@/types/component.js';
interface DeckFactoryProps {
    newCompId: string;
    onAdd: (newComponent: ComponentInfo, additionalParams?: Partial<GameParam>) => void;
    onSuccess: () => void;
}
export declare const DeckFactory: ({ newCompId, onAdd, onSuccess }: DeckFactoryProps) => import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=DeckFactory.d.ts.map