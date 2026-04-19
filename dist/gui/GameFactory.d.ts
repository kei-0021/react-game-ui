import { GameParam } from '@/types/gameParam.js';
import type { Socket } from 'socket.io-client';
interface GameFactoryProps {
    socket: Socket;
    GameParam: GameParam[];
    selectedGameId: string;
    onSelect: (gameId: string) => void;
}
export declare const GameFactory: ({ socket, GameParam, selectedGameId, onSelect }: GameFactoryProps) => import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=GameFactory.d.ts.map