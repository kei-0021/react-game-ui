import { DiceId } from '@/types/definition.js';
import { GameParam } from '@/types/gameParam.js';
import { RoomState } from '@/types/roomState.js';
import { RoomManager } from '../room-manager.js';
export declare class DiceManager {
    private param;
    private state;
    constructor(param: GameParam, state: RoomState);
    /**
     * ダイスを振る
     * @param diceId - ダイスID
     */
    rollDice(diceId: DiceId, roomManager: RoomManager): number;
}
//# sourceMappingURL=dice-manager.d.ts.map