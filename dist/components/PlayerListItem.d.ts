import { Player } from '@/types/player.js';
import * as React from 'react';
import { Socket } from 'socket.io-client';
import { CardId, PlayerId, RoomId } from '../types/definition.js';
type PlayerListItemProps = {
    socket: Socket;
    roomId: RoomId;
    player: Player;
    currentPlayerId: PlayerId | null | undefined;
    myPlayerId: PlayerId | null;
    playCardButton: [boolean, boolean];
    selectedCards: CardId[];
    heldCards: CardId[];
    toggleCardSelection: (cardId: string, isOwner: boolean) => void;
    isDebug?: boolean;
    enabled: boolean;
};
export declare const PlayerListItem: React.MemoExoticComponent<({ socket, roomId, player, currentPlayerId, myPlayerId, playCardButton, selectedCards, heldCards, toggleCardSelection, isDebug, enabled, }: PlayerListItemProps) => import("react/jsx-runtime").JSX.Element>;
export {};
//# sourceMappingURL=PlayerListItem.d.ts.map