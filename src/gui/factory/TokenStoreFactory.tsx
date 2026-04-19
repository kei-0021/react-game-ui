// src/gui/TokenStoreFactory.tsx
import { ComponentInfo, ComponentType } from '@/types/component.js';
import { useState } from 'react';
import styles from '../ControlPanel.module.css';

interface TokenStoreFactoryProps {
  newCompId: string;
  onAdd: (newComponent: ComponentInfo, additionalParams?: any) => void;
  onSuccess: () => void;
  getInitialProps: (type: ComponentType, targetId: string) => any;
}

export const TokenStoreFactory = ({ newCompId, onAdd, onSuccess, getInitialProps }: TokenStoreFactoryProps) => {
  const [newTokenCount, setNewTokenCount] = useState<number>(10);

  const handleAdd = () => {
    const id = newCompId || `token-${Date.now()}`;
    const initialProps = getInitialProps('TokenStore', id);

    const additionalParams = {
      initialTokenStores: [
        {
          tokenStoreId: id,
          name: id,
          tokens: Array.from({ length: newTokenCount }, (_, i) => ({
            id: `${id}-s${i + 1}`,
            name: '💰',
            color: '#D4AF37',
          })),
        },
      ],
    };

    onAdd({ id, type: 'TokenStore', props: initialProps }, additionalParams);
    onSuccess();
  };

  return (
    <div className={styles.field} style={{ marginTop: '10px' }}>
      <div className={styles.label} style={{ fontSize: '11px' }}>
        初期個数:
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <input
          type="range"
          min="1"
          max="50"
          value={newTokenCount}
          onChange={(e) => setNewTokenCount(Number(e.target.value))}
          className={styles.slider}
        />
        <span style={{ fontSize: '12px', color: '#fff', minWidth: '30px' }}>{newTokenCount}</span>
      </div>

      <button
        className={styles.saveButton}
        style={{ width: '100%', marginTop: '10px' }}
        onClick={handleAdd}
        disabled={!newCompId}
      >
        TokenStoreを追加
      </button>
    </div>
  );
};
