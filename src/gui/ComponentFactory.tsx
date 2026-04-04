// src/gui/ComponentFactory.tsx
import { ComponentId } from '@/types/definition.js';
import { COMPONENT_TYPES, ComponentInfo, ComponentType } from '@/types/server.js';
import { GameMeta } from '@/types/socketData.js';
import { useState } from 'react';
import styles from './ControlPanel.module.css';

interface ComponentFactoryProps {
  onAdd: (newComponent: ComponentInfo, additionalParams?: any) => void;
  onDelete: (compId: ComponentId, additionalParams?: any) => void;
  existingComponents: ComponentInfo[];
  fullGameParam?: GameMeta;
  containerRef: React.RefObject<HTMLElement | null>;
}

export const ComponentFactory = ({
  onAdd,
  onDelete,
  existingComponents,
  fullGameParam,
  containerRef,
}: ComponentFactoryProps) => {
  const [newCompId, setNewCompId] = useState('');
  const [newCompType, setNewCompType] = useState<ComponentType>('Dice');

  // ScoreBoard関連
  const [sbPlayCard, setSbPlayCard] = useState<boolean>(true);
  const [sbHold, setSbHold] = useState<boolean>(false);
  const [sbFlip, setSbFlip] = useState<boolean>(false);
  const [sbTurnSkip, setSbTurnSkip] = useState<boolean>(true);
  const [sbRoundSkip, setSbRoundSkip] = useState<boolean>(false);

  // Token関連
  const [newTokenCount, setNewTokenCount] = useState<number>(10);

  // Dice関連
  const [newDiceSides, setNewDiceSides] = useState<number>(6);

  // Draggable関連
  const [newDraggableColor, setNewDraggableColor] = useState<string>('#ff0000');
  const [uploadImage, setUploadImage] = useState<string | null>(null);
  const [newDraggableX, setNewDraggableX] = useState<number>(500);
  const [newDraggableY, setNewDraggableY] = useState<number>(500);
  const [isDraggingPreview, setIsDraggingPreview] = useState(false);

  const existingIds = existingComponents.map((c) => c.id);
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
          deckId: newCompId,
          title: '山札',
        };
        additionalParams.initialDecks = [
          {
            deckId: newCompId,
            name: 'カード',
            backColor: 'black',
            cards: [
              {
                id: `${newCompId}-c1`,
                deckId: newCompId,
                name: '1',
                ownerId: null,
                location: 'deck',
                drawCondition: ['hand', 'back'],
                fieldBackCondition: ['discard', 'face'],
                playLocation: 'field',
                isFaceUp: true,
                backColor: 'black',
              },
            ],
          },
        ];
        break;
      case 'PlayField':
        initialProps = {
          deckId: newCompId,
          title: newCompId,
        };
        break;
      case 'ScoreBoard':
        initialProps = {
          playCardButton: [sbPlayCard, true],
          holdButton: [sbHold, true],
          flipButton: [sbFlip, true],
          turnSkipButton: [sbTurnSkip, true],
          roundSkipButton: [sbRoundSkip, true],
        };
        break;
      case 'TokenStore':
        initialProps = {
          tokenStoreId: newCompId,
          title: `トークン置き場`,
        };
        additionalParams.initialTokenStores = [
          {
            tokenStoreId: newCompId,
            name: newCompId,
            tokens: Array.from({ length: newTokenCount }, (_, i) => ({
              id: `${newCompId}-s${i + 1}`,
              name: '💰',
              color: '#D4AF37',
            })),
          },
        ];
        break;
      case 'GridBoard':
        initialProps = {
          boardId: newCompId,
          allowPieceDrag: true,
        };
        break;
      case 'Draggable':
        initialProps = {
          draggableId: newCompId,
          image: uploadImage || '/hanabishi.svg',
          mask: true,
          color: newDraggableColor,
          size: 100,
          isDebug: true,
        };
        additionalParams.draggables = {
          [newCompId]: {
            id: newCompId,
            coordinate: { x: newDraggableX, y: newDraggableY },
            zIndex: 100,
            rotation: 0,
          },
        };
        break;
      case 'Dice':
        initialProps = {
          diceId: newCompId,
          sides: newDiceSides,
          title: `${newDiceSides}面ダイス`,
          // 4面の場合は天気ダイス
          customFaces:
            newDiceSides === 4
              ? ['/weather_sunny.png', '/weather_cloud.png', '/weather_wind.png', '/weather_rain.png']
              : [],
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

  const handleDeleteClick = (compId: ComponentId) => {
    const target = existingComponents.find((c) => c.id === compId);
    if (!target) return;

    let additionalParams: Partial<GameMeta> = {};

    // 削除対象のタイプに応じて、消すべき Record のキーを指定
    if (target.type === 'Draggable') {
      const currentDraggables = { ...(fullGameParam?.draggables || {}) };
      delete currentDraggables[compId];
      additionalParams.draggables = currentDraggables;
    }

    if (target.type === 'TokenStore') {
      additionalParams.initialTokenStores = (fullGameParam?.initialTokenStores || []).filter(
        (s) => s.tokenStoreId !== compId,
      );
    }

    // 最終的な削除実行を親（ControlPanel）に伝える
    onDelete(compId, additionalParams);
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
        <button className={styles.saveButton} onClick={handleAddClick} disabled={!newCompId || isDuplicateId}>
          追加
        </button>
      </div>
      {isDuplicateId && (
        <div style={{ color: '#ff4444', fontSize: '12px', marginTop: '-4px' }}>このIDは既に使用されています</div>
      )}

      {/* ScoreBoard専用の設定項目 */}
      {newCompType === 'ScoreBoard' && (
        <div
          className={styles.field}
          style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '5px' }}
        >
          <div className={styles.label} style={{ fontSize: '11px' }}>
            有効にするボタン:
          </div>

          {[
            { label: 'カードプレイ', state: sbPlayCard, setter: setSbPlayCard },
            { label: 'ホールド', state: sbHold, setter: setSbHold },
            { label: 'フリップ', state: sbFlip, setter: setSbFlip },
            { label: 'ターンスキップ', state: sbTurnSkip, setter: setSbTurnSkip },
            { label: 'ラウンドスキップ', state: sbRoundSkip, setter: setSbRoundSkip },
          ].map((item) => (
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
              <input
                type="checkbox"
                checked={item.state}
                onChange={(e) => item.setter(e.target.checked)}
                style={{ cursor: 'pointer' }}
              />
              {item.label}
            </label>
          ))}
        </div>
      )}

      {/* トークン専用の設定項目 */}
      {newCompType === 'TokenStore' && (
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
        </div>
      )}

      {/* ダイス専用の設定項目 */}
      {newCompType === 'Dice' && (
        <div className={styles.field} style={{ marginTop: '10px' }}>
          <div className={styles.label} style={{ fontSize: '11px' }}>
            面数を選択:
          </div>
          <select
            className={styles.compTypeSelect}
            value={newDiceSides}
            onChange={(e) => setNewDiceSides(Number(e.target.value))}
          >
            {[2, 3, 4, 5, 6, 8, 10, 12, 20].map((n) => (
              <option key={n} value={n}>
                {n}面
              </option>
            ))}
          </select>
        </div>
      )}

      {newCompType === 'Draggable' && (
        <div className={styles.field} style={{ marginTop: '10px' }}>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '10px' }}>
            <div className={styles.label} style={{ fontSize: '11px', margin: 0 }}>
              色:
            </div>
            <input
              type="color"
              value={newDraggableColor}
              onChange={(e) => setNewDraggableColor(e.target.value)}
              style={{ cursor: 'pointer', border: 'none', background: 'none', width: '30px', height: '24px' }}
            />
          </div>

          <div className={styles.label} style={{ fontSize: '11px' }}>
            画像アップロード:
          </div>
          <input type="file" accept="image/*" className={styles.select} onChange={handleFileChange} />

          <div
            draggable // HTML5のドラッグ機能を有効化
            onDragStart={(e) => {
              const dragData = {
                type: 'Draggable',
                id: newCompId || `drag-${Date.now()}`, // compId ではなく id に統一
                props: {
                  image: uploadImage || '/hanabishi.svg',
                  color: newDraggableColor,
                  size: 100,
                },
              };
              e.dataTransfer.setData('application/react-game-ui', JSON.stringify(dragData));
            }}
            className={styles.dragSourcePreview}
            style={{
              width: '60px',
              height: '60px',
              border: `2px solid ${newDraggableColor}`,
              backgroundColor: `${newDraggableColor}4D`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'grab',
              borderRadius: '4px',
            }}
          >
            <span style={{ fontSize: '10px', color: 'white' }}>DRAG ME</span>
          </div>
        </div>
      )}

      {/* --- 既存コンポーネントのリスト表示と削除ボタン --- */}
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
