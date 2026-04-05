import type { PlayerId, RoomManager } from 'react-game-ui';

/**
 * 盤面セルの着地効果定義
 */
export const cellEffects: Record<string, (manager: RoomManager, playerId: PlayerId) => void> = {
  'Relic Site 1': (manager, playerId) => {
    if (playerId) {
      manager.addScore(playerId, 2);
      manager.emitSystemMessage(`💎 ${playerId} が 遺跡跡地(1) に着地し、アーティファクト を +1 獲得。`);
    }
  },

  'Relic Site 2': (manager, playerId) => {
    if (playerId) {
      manager.addScore(playerId, 5);
      manager.emitSystemMessage(`⚙️ ${playerId} が 遺跡跡地(2) に着地し、アーティファクト を +1 獲得。`);
    }
  },

  'Energy Vein': (manager, playerId) => {
    if (playerId && manager) {
      manager.acquireResource(playerId, 'OXYGEN', 20);
      manager.emitSystemMessage(`🫧 ${playerId} が エネルギー脈 に着地し、酸素 を 20 回復。`);
    }
  },

  'Dangerous Zone': (manager, playerId) => {
    if (playerId && manager) {
      manager.acquireResource(playerId, 'OXYGEN', -100);
      manager.acquireResource(playerId, 'BATTERY', -100);
      manager.emitSystemMessage(`🌋 ${playerId} が 危険地帯 に着地。 酸素 と バッテリー を -100 損失。`);
    }
  },

  'Empty Deep Sea': (manager, playerId) => {
    manager.emitSystemMessage('海は静かだ');
  },

  'Abyss Landmark': (manager, playerId) => {
    if (playerId) {
      manager.emitSystemMessage(`💰 ${playerId} が 遺物トークン を獲得！`);
      manager.acquireToken('ARTIFACT', null, playerId);
    }
  },
};
