// tests/types/phase.ts
import { Phase } from '../../src/types/phase.js';

export class DeepAbyssPhase extends Phase {
  static readonly START = new (class extends DeepAbyssPhase {
    readonly name = 'start';
  })();
  static readonly NEXT = new (class extends DeepAbyssPhase {
    readonly name = 'next';
  })();
  static readonly FINAL = new (class extends DeepAbyssPhase {
    readonly name = 'final';
  })();

  // abstract 対策のベース定義
  readonly name: string = 'base';
}
