// src/gui/LogicFactory.tsx
import { Instruction } from '@/types/instruction.js';
import styles from './ControlPanel.module.css';

interface LogicFactoryProps {
  instructions: Instruction[];
  onChange: (newInstructions: Instruction[]) => void;
}

export const LogicFactory = ({ instructions, onChange }: LogicFactoryProps) => {
  const handleAdd = () => {
    onChange([...instructions, { type: 'ADD_SCORE', playerId: 'ALL', points: 0 }]);
  };

  const handleUpdate = (index: number, patch: Partial<Instruction>) => {
    const next = [...instructions];
    next[index] = { ...next[index], ...patch } as Instruction;
    onChange(next);
  };

  const handleDelete = (index: number) => {
    onChange(instructions.filter((_, i) => i !== index));
  };

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

          {/* 必要なプロパティ入力をここに追加していく */}

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
