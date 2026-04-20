// src/server/logic/dice-manager.ts
import { DiceId } from '@/types/definition.js';
import { GameParam } from '@/types/gameParam.js';
import { RoomState } from '@/types/roomState.js';
import { RoomManager } from '../room-manager.js';

export class DiceManager {
  constructor(
    private param: GameParam,
    private state: RoomState,
  ) {}

  /**
   * ダイスを振る
   * @param diceId - ダイスID
   */
  rollDice(diceId: DiceId, roomManager: RoomManager): number {
    const sides = this.state.dice[diceId].sides;

    const value = Math.floor(Math.random() * sides) + 1;
    this.state.dice[diceId].currentValue = value;

    if (this.param.onDiceRoll) {
      this.param.onDiceRoll(value, roomManager);
    }
    roomManager.server_log('dice', `Dice ${diceId} rolled. Result: ${value}`);

    return value;
  }
}
