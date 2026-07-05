export class DiceManager {
    param;
    state;
    constructor(param, state) {
        this.param = param;
        this.state = state;
    }
    /**
     * ダイスを振る
     * @param diceId - ダイスID
     */
    rollDice(diceId, roomManager) {
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
