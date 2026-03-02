// src/types/phase.ts

/**
 * ゲームフェーズの基底クラス。
 * 利用者はこれを継承して独自のフェーズセットを定義する。
 */
export abstract class Phase {
  abstract readonly name: string;

  toString() {
    return this.name;
  }
}
