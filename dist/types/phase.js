// src/types/phase.ts
/**
 * ゲームフェーズの基底クラス。
 * 利用者はこれを継承して独自のフェーズセットを定義する。
 */
export class Phase {
    toString() {
        return this.name;
    }
}
