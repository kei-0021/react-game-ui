// src/server/logic/update-state.ts
import { RoomState } from '@/types/server.js';
import { deepFill } from './utils.js';

export function updateState(oldState: RoomState, newState: RoomState): void {
  // players は参照を維持したいため除外
  deepFill(oldState, newState, ['players']);
}
