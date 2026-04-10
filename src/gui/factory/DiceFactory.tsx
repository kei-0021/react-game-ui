// src/gui/factory/DiceFactory.tsx
import { ComponentInfo, ComponentType } from '@/types/component.js';
import { useState } from 'react';
import styles from '../ControlPanel.module.css';

interface DiceFactoryProps {
  newCompId: string;
  onAdd: (newComponent: ComponentInfo) => void;
  onSuccess: () => void;
  // ComponentFactory側の共通ロジックを利用するための関数を受け取る
  getInitialProps: (type: ComponentType, targetId: string, sides: number) => any;
}

export const DiceFactory = ({ newCompId, onAdd, onSuccess, getInitialProps }: DiceFactoryProps) => {
  const [newDiceSides, setNewDiceSides] = useState<number>(6);

  const handleAdd = () => {
    const id = newCompId || `dice-${Date.now()}`;
    const initialProps = getInitialProps('Dice', id, newDiceSides);

    onAdd({
      id: id,
      type: 'Dice',
      props: initialProps,
    });
    onSuccess();
  };

  const handleDragStart = (e: React.DragEvent) => {
    const id = newCompId || `dice-${Date.now()}`;
    const dragData = {
      type: 'Dice',
      id: id,
      props: {
        ...getInitialProps('Dice', id, newDiceSides),
        slotX: 1,
        slotY: 1,
      },
    };
    e.dataTransfer.setData('application/react-game-ui', JSON.stringify(dragData));
  };

  return (
    <div className={styles.field} style={{ marginTop: '10px' }}>
      <div className={styles.label} style={{ fontSize: '11px' }}>
        面数を選択:
      </div>
      <select
        className={styles.compTypeSelect}
        value={newDiceSides}
        onChange={(e) => setNewDiceSides(Number(e.target.value))}
        style={{ marginBottom: '10px' }}
      >
        {[2, 3, 4, 5, 6, 8, 10, 12, 20].map((n) => (
          <option key={n} value={n}>
            {n}面
          </option>
        ))}
      </select>

      <div
        draggable
        onDragStart={handleDragStart}
        className={styles.dragSourcePreview}
        style={{
          width: '60px',
          height: '60px',
          border: '2px dashed #888',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'grab',
          borderRadius: '8px',
          backgroundColor: 'rgba(255,255,255,0.1)',
          marginBottom: '10px',
        }}
      >
        <span style={{ fontSize: '20px' }}>🎲</span>
        <span style={{ fontSize: '10px', color: '#ccc' }}>{newDiceSides}面</span>
      </div>

      <button className={styles.saveButton} style={{ width: '100%' }} onClick={handleAdd} disabled={!newCompId}>
        Diceを追加
      </button>
    </div>
  );
};
