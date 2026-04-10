// src/gui/factory/ScoreBoardFactory.tsx
import { ComponentInfo, ComponentType } from '@/types/component.js';
import { useState } from 'react';
import styles from '../ControlPanel.module.css';

interface ScoreBoardFactoryProps {
  newCompId: string;
  onAdd: (newComponent: ComponentInfo) => void;
  onSuccess: () => void;
  getInitialProps: (type: ComponentType, targetId: string, overrides: any) => any;
}

export const ScoreBoardFactory = ({ newCompId, onAdd, onSuccess, getInitialProps }: ScoreBoardFactoryProps) => {
  const [sbPlayCard, setSbPlayCard] = useState<boolean>(true);
  const [sbHold, setSbHold] = useState<boolean>(false);
  const [sbFlip, setSbFlip] = useState<boolean>(false);
  const [sbTurnSkip, setSbTurnSkip] = useState<boolean>(true);
  const [sbRoundSkip, setSbRoundSkip] = useState<boolean>(false);

  const handleAdd = () => {
    const id = newCompId || `sb-${Date.now()}`;
    const overrides = {
      sbPlayCard,
      sbHold,
      sbFlip,
      sbTurnSkip,
      sbRoundSkip,
    };

    onAdd({
      id: id,
      type: 'ScoreBoard',
      props: getInitialProps('ScoreBoard', id, overrides),
    });
    onSuccess();
  };

  const buttonConfigs = [
    { label: 'カードプレイ', state: sbPlayCard, setter: setSbPlayCard },
    { label: 'ホールド', state: sbHold, setter: setSbHold },
    { label: 'フリップ', state: sbFlip, setter: setSbFlip },
    { label: 'ターンスキップ', state: sbTurnSkip, setter: setSbTurnSkip },
    { label: 'ラウンドスキップ', state: sbRoundSkip, setter: setSbRoundSkip },
  ];

  return (
    <div className={styles.field} style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
      <div className={styles.label} style={{ fontSize: '11px' }}>
        有効にするボタン:
      </div>

      {buttonConfigs.map((item) => (
        <label
          key={item.label}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
            fontSize: '12px',
            color: '#fff',
          }}
        >
          <input type="checkbox" checked={item.state} onChange={(e) => item.setter(e.target.checked)} />
          {item.label}
        </label>
      ))}

      <button
        className={styles.saveButton}
        style={{ width: '100%', marginTop: '5px' }}
        onClick={handleAdd}
        disabled={!newCompId}
      >
        ScoreBoardを追加
      </button>
    </div>
  );
};
