import { GameMeta } from '@/types/socketData.js';
import type { Socket } from 'socket.io-client';
interface GameFactoryProps {
    socket: Socket;
    gameMeta: GameMeta[];
    selectedGameId: string;
    onSelect: (gameId: string) => void;
}
export declare const GameFactory: ({ socket, gameMeta, selectedGameId, onSelect }: GameFactoryProps) => import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=GameFactory.d.ts.map