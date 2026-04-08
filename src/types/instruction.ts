// src/types/instruction.ts

import { PlayerId } from '@/types/definition.js';
import { Phase } from '@/types/phase.js';

// 各命令の形を定義
export type Instruction =
  | { type: 'ADD_SCORE'; playerId: PlayerId | 'ALL'; points: number }
  | { type: 'EMIT_MSG'; text: string; duration?: number }
  | { type: 'UPDATE_PHASE'; newPhase: Phase };
