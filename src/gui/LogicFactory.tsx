// src/gui/LogicFactory.tsx
import { GameParam } from '@/index.js';
import { Instruction } from '@/types/instruction.js';
import { useEffect, useState } from 'react';
import styles from './ControlPanel.module.css';

interface LogicFactoryProps {
  selectedGame: GameParam | undefined;
  isSaving: boolean;
  /** 変更状態と最新の命令リストを親へ同期する */
  onSync: (isDirty: boolean, instructions: Instruction[]) => void;
}

export const LogicFactory = ({ selectedGame, isSaving, onSync }: LogicFactoryProps) => {
  const [instructions, setInstructions] = useState<Instruction[]>([]);
  const [initialInstructions, setInitialInstructions] = useState<Instruction[]>([]);

  // 内部でDirtyチェックを完結させる
  const isDirty = JSON.stringify(instructions) !== JSON.stringify(initialInstructions);

  // サーバーデータとの同期ロジックを移設
  useEffect(() => {
    if (selectedGame && !isSaving) {
      const rawOnCardPlay = selectedGame.onCardPlay;
      const configOnCardPlay = Array.isArray(rawOnCardPlay) ? rawOnCardPlay : [];

      setInitialInstructions([...configOnCardPlay]);

      if (!isDirty) {
        setInstructions([...configOnCardPlay]);
      }
    }
  }, [selectedGame, isSaving]);

  // 状態変化を親の ControlPanel へ通知
  useEffect(() => {
    onSync(isDirty, instructions);
  }, [isDirty, instructions]);

  const handleAdd = () => {
    onChange([...instructions, { type: 'ADD_SCORE', playerId: 'ALL', points: 0 }]);
  };

  const onChange = (newInstructions: Instruction[]) => {
    setInstructions(newInstructions);
  };

  const handleUpdate = (index: number, patch: Partial<Instruction>) => {
    const next = [...instructions];
    next[index] = { ...next[index], ...patch } as Instruction;
    onChange(next);
  };

  const handleDelete = (index: number) => {
    onChange(instructions.filter((_, i) => i !== index));
  };

  if (!selectedGame) return null;

  return (
    <div className={styles.section}>
      <h4 className={styles.subTitle}>onCardPlay ロジック</h4>
      {instructions.map((inst, idx) => (
        <div key={idx} className={styles.effectRow}>
          <select value={inst.type} onChange={(e) => handleUpdate(idx, { type: e.target.value as any })}>
            <option value="ADD_SCORE">ADD_SCORE</option>
            <option value="EMIT_MSG">EMIT_MSG</option>
            <option value="UPDATE_PHASE">UPDATE_PHASE</option>
          </select>

          {inst.type === 'ADD_SCORE' && (
            <input
              type="number"
              value={inst.points || 0}
              onChange={(e) => handleUpdate(idx, { points: Number(e.target.value) })}
              placeholder="点数"
            />
          )}

          <button className={styles.deleteMini} onClick={() => handleDelete(idx)}>
            削除
          </button>
        </div>
      ))}
      <button className={styles.addBtn} onClick={handleAdd}>
        + 命令を追加
      </button>
    </div>
  );
};
