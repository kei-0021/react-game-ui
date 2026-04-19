import { GameParam } from '@/index.js';
import { Instruction } from '@/types/instruction.js';
interface LogicFactoryProps {
    selectedGame: GameParam | undefined;
    isSaving: boolean;
    /** 変更状態と最新の命令リストを親へ同期する */
    onSync: (isDirty: boolean, instructions: Instruction[]) => void;
}
export declare const LogicFactory: ({ selectedGame, isSaving, onSync }: LogicFactoryProps) => import("react/jsx-runtime").JSX.Element | null;
export {};
//# sourceMappingURL=LogicFactory.d.ts.map