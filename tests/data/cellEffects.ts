import type { PlayerId } from '../../src/types/definition';

/**
 * 各エフェクト関数が受け取る引数の型定義
 */
interface EffectArgs {
  playerId?: PlayerId;
  updateResource?: (id: PlayerId, type: 'OXYGEN' | 'BATTERY', amount: number) => void;
}

export const cellEffects: Record<string, (args: EffectArgs) => void> = {
  'Relic Site 1': ({ playerId }) => {
    if (playerId) {
      console.log(`[EFFECT] ${playerId} が 遺跡跡地(1) に着地し、アーティファクト を +1 獲得。`);
    }
  },

  'Relic Site 2': ({ playerId }) => {
    if (playerId) {
      console.log(`[EFFECT] ${playerId} が 遺跡跡地(2) に着地し、アーティファクト を +1 獲得。`);
    }
  },

  'Energy Vein': ({ playerId, updateResource }) => {
    if (playerId && updateResource) {
      updateResource(playerId, 'OXYGEN', 20);
      console.log(`🫧 ${playerId} が エネルギー脈 に着地し、酸素 を 20 回復。`);
    }
  },

  'Dangerous Zone': ({ playerId, updateResource }) => {
    if (playerId && updateResource) {
      updateResource(playerId, 'OXYGEN', -100);
      updateResource(playerId, 'BATTERY', -100);
      console.log(`🌋 ${playerId} が 危険地帯 に着地。 酸素 と バッテリー を -100 損失。`);
    }
  },

  'Empty Deep Sea': ({}) => {
    console.log('🌊 何もない深海: 海は静かだ');
  },

  'Abyss Landmark': ({ playerId }) => {
    if (playerId) {
      console.log(`[EFFECT] ${playerId} が 深淵のランドマーク に到達し、アーティファクト を +5 獲得。`);
    }
  },
};
