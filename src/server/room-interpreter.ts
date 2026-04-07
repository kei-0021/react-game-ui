// src/server/room-interpreter.ts

import { PlayerId } from '@/types/definition.js';
import { RoomState } from '@/types/server.js';
import { RoomManager } from './room-manager.js';

// 各命令の形を定義
type Instruction =
  | { type: 'ADD_SCORE'; playerId: PlayerId | 'ALL'; points: number }
  | { type: 'EMIT_MSG'; text: string; duration?: number };

export const roomInterpreter = (instructions: Instruction[], state: RoomState, manager: RoomManager) => {
  const instList = Array.isArray(instructions) ? instructions : [instructions];

  instList.forEach((inst) => {
    switch (inst.type) {
      case 'ADD_SCORE':
        if (inst.playerId === 'ALL') {
          state.players.forEach((p) => manager.addScore(p.id, inst.points));
        } else {
          manager.addScore(inst.playerId, inst.points);
        }
        break;
      case 'EMIT_MSG':
        manager.emitSystemMessage(inst.text, inst.duration ?? 1000, true);
        break;
      default:
        console.warn(`未定義の命令です: ${(inst as any).type}`);
    }
  });
};
