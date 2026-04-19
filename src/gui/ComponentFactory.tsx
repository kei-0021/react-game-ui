// src/gui/ComponentFactory.tsx
import { GameParam } from '@/index.js';
import { COMPONENT_TYPES, ComponentInfo, ComponentType } from '@/types/component.js';
import { ComponentId } from '@/types/definition.js';
import { useState } from 'react';
import styles from './ControlPanel.module.css';
import { DeckFactory } from './factory/DeckFactory.js';
import { DiceFactory } from './factory/DiceFactory.js';
import { DraggableFactory } from './factory/DraggableFactory.js';
import { ScoreBoardFactory } from './factory/ScoreBoardFactory.js';
import { TokenStoreFactory } from './factory/TokenStoreFactory.js';

const FILTERED_COMPONENT_TYPES = COMPONENT_TYPES.filter((type) => type !== 'PlayField');

interface ComponentFactoryProps {
  onAdd: (newComponent: ComponentInfo, additionalParams?: any) => void;
  onDelete: (compId: ComponentId, additionalParams?: any) => void;
  existingComponents: ComponentInfo[];
  fullGameParam?: GameParam;
  containerRef: React.RefObject<HTMLElement | null>;
}

export const ComponentFactory = ({ onAdd, onDelete, existingComponents, fullGameParam }: ComponentFactoryProps) => {
  const [newCompId, setNewCompId] = useState('');
  const [newCompType, setNewCompType] = useState<ComponentType>('Dice');

  const existingIds = existingComponents.map((c) => c.id);
  const isDuplicateId = existingIds.includes(newCompId);

  // Factory管理対象のリスト
  const FACTORY_MANAGED_TYPES: ComponentType[] = ['Deck', 'Dice', 'Draggable', 'ScoreBoard', 'TokenStore'];

  /**
   * Props生成ロジックの集約
   */
  const getInitialProps = (type: ComponentType, targetId: string, overrides: any = {}) => {
    switch (type) {
      case 'Dice':
        const sides = overrides.sides || 6;
        return {
          diceId: targetId,
          sides: sides,
          title: `${sides}面ダイス`,
          customFaces:
            sides === 4 ? ['/weather_sunny.png', '/weather_cloud.png', '/weather_wind.png', '/weather_rain.png'] : [],
        };
      case 'Draggable':
        return {
          draggableId: targetId,
          image: overrides.image || '/hanabishi.svg',
          mask: true,
          color: overrides.color || '#ff0000',
          size: 100,
          isDebug: true,
        };
      case 'ScoreBoard':
        return {
          playCardButton: [overrides.sbPlayCard ?? true, true],
          holdButton: [overrides.sbHold ?? false, true],
          flipButton: [overrides.sbFlip ?? false, true],
          turnSkipButton: [overrides.sbTurnSkip ?? true, true],
          roundSkipButton: [overrides.sbRoundSkip ?? false, true],
        };
      case 'TokenStore':
        return {
          tokenStoreId: targetId,
          title: `トークン置き場`,
        };
      case 'Timer':
        return { initialDuration: 30 };
      default:
        return {};
    }
  };

  const handleAddClick = () => {
    if (!newCompId || isDuplicateId) return;

    // Factory分離済みのタイプはここでは処理しない
    if (FACTORY_MANAGED_TYPES.includes(newCompType)) return;

    const initialProps = getInitialProps(newCompType, newCompId);

    // 現在のComponentFactoryに残っている追加ロジックはTimer等のシンプルなもののみ
    onAdd({ id: newCompId, type: newCompType, props: initialProps });
    setNewCompId('');
  };

  const handleDeleteClick = (compId: ComponentId) => {
    const target = existingComponents.find((c) => c.id === compId);
    if (!target) return;

    let additionalParams: Partial<GameParam> = {};

    if (target.type === 'Deck') {
      const originalDecks = fullGameParam?.initialDecks || [];
      additionalParams.initialDecks = originalDecks.filter((d) => d.deckId !== compId);
    }

    if (target.type === 'TokenStore') {
      additionalParams.initialTokenStores = (fullGameParam?.initialTokenStores || []).filter(
        (s) => s.tokenStoreId !== compId,
      );
    }

    if (target.type === 'Draggable') {
      const currentDraggables = { ...(fullGameParam?.draggables || {}) };
      delete currentDraggables[compId];
      additionalParams.draggables = currentDraggables;
    }

    onDelete(compId, additionalParams);
  };

  const isFactoryManaged = FACTORY_MANAGED_TYPES.includes(newCompType);

  return (
    <div className={styles.addComponentBox}>
      <div className={styles.label}>コンポーネント追加:</div>

      <div className={styles.createSection}>
        <select
          className={styles.compTypeSelect}
          value={newCompType}
          onChange={(e) => setNewCompType(e.target.value as ComponentType)}
        >
          {FILTERED_COMPONENT_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>

        <input
          type="text"
          className={styles.flexFill}
          style={{ borderColor: isDuplicateId ? '#ff4444' : '' }}
          placeholder="ID (例: dice-2)"
          value={newCompId}
          onChange={(e) => setNewCompId(e.target.value)}
        />

        {/* Factory管理外のものだけ共通追加ボタンを表示 */}
        {!isFactoryManaged && (
          <button className={styles.saveButton} onClick={handleAddClick} disabled={!newCompId || isDuplicateId}>
            追加
          </button>
        )}
      </div>

      {isDuplicateId && (
        <div style={{ color: '#ff4444', fontSize: '12px', marginTop: '-4px' }}>このIDは既に使用されています</div>
      )}

      {/* --- コンポーネント別 Factory 呼び出し --- */}

      {newCompType === 'Deck' && <DeckFactory newCompId={newCompId} onAdd={onAdd} onSuccess={() => setNewCompId('')} />}

      {newCompType === 'Dice' && (
        <DiceFactory
          newCompId={newCompId}
          onAdd={onAdd}
          onSuccess={() => setNewCompId('')}
          getInitialProps={(type, id, sides) => getInitialProps(type, id, { sides })}
        />
      )}

      {newCompType === 'Draggable' && (
        <DraggableFactory
          newCompId={newCompId}
          onAdd={onAdd}
          onSuccess={() => setNewCompId('')}
          getInitialProps={getInitialProps}
        />
      )}

      {newCompType === 'ScoreBoard' && (
        <ScoreBoardFactory
          newCompId={newCompId}
          onAdd={onAdd}
          onSuccess={() => setNewCompId('')}
          getInitialProps={getInitialProps}
        />
      )}

      {newCompType === 'TokenStore' && (
        <TokenStoreFactory
          newCompId={newCompId}
          onAdd={onAdd}
          onSuccess={() => setNewCompId('')}
          getInitialProps={getInitialProps}
        />
      )}

      {/* --- 既存コンポーネントのリスト表示 --- */}

      {existingComponents.length > 0 && (
        <div style={{ marginTop: '15px' }}>
          <div className={styles.label}>配置済みコンポーネント:</div>
          <div className={styles.componentList}>
            {existingComponents.map((comp) => (
              <div key={comp.id} className={styles.componentItem}>
                <span>
                  {comp.id} <small>({comp.type})</small>
                </span>
                {/* Factory内部の削除ロジックを呼ぶ */}
                <button onClick={() => handleDeleteClick(comp.id)} className={styles.deleteCompBtn}>
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
