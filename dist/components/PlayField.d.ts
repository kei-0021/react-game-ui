import { Socket } from 'socket.io-client';
import type { DeckId, PlayerId, RoomId } from '../types/definition.js';
import type { PlayerWithResources } from '../types/playerWithResources.js';
import './PlayField.css';
type PlayFieldProps = {
    socket: Socket;
    roomId: RoomId;
    deckId: DeckId;
    title?: string;
    players: PlayerWithResources[];
    myPlayerId: PlayerId | null;
    layoutMode?: 'grid' | 'free';
    is_logging?: boolean;
    backgroundImage?: string;
};
export declare function PlayField({ socket, roomId, deckId, title, players, myPlayerId, layoutMode, is_logging, backgroundImage, }: PlayFieldProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=PlayField.d.ts.map