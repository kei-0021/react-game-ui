// src/gui/ComponentFactory.tsx
import { COMPONENT_TYPES, ComponentInfo, ComponentType } from '@/types/server.js';
import { GameMeta } from '@/types/socketData.js';
import { useState } from 'react';
import styles from './ControlPanel.module.css';

interface ComponentFactoryProps {
  onAdd: (newComponent: ComponentInfo, additionalParams?: any) => void;
  existingIds: string[];
}

export const ComponentFactory = ({ onAdd, existingIds }: ComponentFactoryProps) => {
  const [newCompId, setNewCompId] = useState('');
  const [newCompType, setNewCompType] = useState<ComponentType>('Dice');
  const [uploadImage, setUploadImage] = useState<string | null>(null);

  const isDuplicateId = existingIds.includes(newCompId);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setUploadImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleAddClick = () => {
    if (!newCompId || isDuplicateId) return;

    let initialProps: Record<string, any> = {};
    let additionalParams: Partial<GameMeta> = {};

    switch (newCompType) {
      case 'Deck':
        initialProps = {
          deckId: `deck-${newCompId}`,
          title: '山札',
        };
        additionalParams.initialDecks = [
          {
            deckId: `deck-${newCompId}`,
            name: 'カード',
            backColor: 'black',
            cards: [
              {
                id: '1',
                deckId: `deck-${newCompId}`,
                name: '1',
                ownerId: null,
                location: 'deck',
                drawCondition: ['field', 'face'],
                playLocation: 'discard',
                isFaceUp: true,
                backColor: 'black',
              },
            ],
          },
        ];
        break;
      case 'PlayField':
        initialProps = {
          deckId: 'sub',
          title: 'sub',
        };
        break;
      case 'ScoreBoard':
        initialProps = {};
        break;
      case 'TokenStore':
        initialProps = {
          tokenStoreId: 'ARTIFACT',
          title: '遺物トークン',
        };
        additionalParams.initialTokenStores = [
          {
            tokenStoreId: 'ARTIFACT',
            name: '遺物',
            tokens: [
              { id: 'ARTIFACT-s1', name: '💰', color: '#D4AF37' },
              { id: 'ARTIFACT-s2', name: '💰', color: '#D4AF37' },
            ],
          },
        ];
        break;
      case 'GridBoard':
        initialProps = {
          boardId: `borad-${newCompId}`,
          allowPieceDrag: true,
        };
        break;
      case 'Draggable':
        initialProps = {
          draggableId: `piece-${newCompId}`,
          image: uploadImage || '/hanabishi.svg',
          mask: true,
          color: 'red',
          size: 100,
          isDebug: true,
        };
        additionalParams.draggables = {
          [`piece-${newCompId}`]: {
            id: `piece-${newCompId}`,
            coordinate: { x: 500, y: 500 },
            zIndex: 100,
            rotation: 0,
          },
        };
        break;
      case 'Dice':
        initialProps = {
          diceId: `天気-${newCompId}`,
          sides: 4,
          title: '天気ダイス',
          tooltipText: '快晴・曇り・風・雨',
          customFaces: ['/weather_sunny.png', '/weather_cloud.png', '/weather_wind.png', '/weather_rain.png'],
        };
        break;
      case 'Timer':
        initialProps = { initialDuration: 30 };
        break;
      case 'SystemMessageWindow':
        initialProps = {};
        break;
      default:
        initialProps = {};
    }

    const newComponent: ComponentInfo = {
      id: newCompId,
      type: newCompType,
      props: initialProps,
    };

    onAdd(newComponent, additionalParams);
    setNewCompId('');
    setUploadImage(null);
  };

  return (
    <div className={styles.addComponentBox}>
      <div className={styles.label}>コンポーネント追加:</div>
      <div className={styles.createSection}>
        <select
          className={styles.compTypeSelect}
          value={newCompType}
          onChange={(e) => setNewCompType(e.target.value as ComponentType)}
        >
          {COMPONENT_TYPES.map((type) => (
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
        <button className={styles.saveButton} onClick={() => handleAddClick()} disabled={!newCompId || isDuplicateId}>
          追加
        </button>
      </div>
      {isDuplicateId && (
        <div style={{ color: '#ff4444', fontSize: '12px', marginTop: '-4px' }}>このIDは既に使用されています</div>
      )}

      {newCompType === 'Draggable' && (
        <div className={styles.field} style={{ marginTop: '10px' }}>
          <div className={styles.label} style={{ fontSize: '11px' }}>
            画像アップロード:
          </div>
          <input type="file" accept="image/*" className={styles.select} onChange={handleFileChange} />
          {uploadImage && (
            <div style={{ marginTop: '5px' }}>
              <img
                src={uploadImage}
                alt="preview"
                style={{ width: '50px', height: '50px', objectFit: 'contain', border: '1px solid #555' }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
