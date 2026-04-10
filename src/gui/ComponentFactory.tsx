// src/gui/ComponentFactory.tsx
import { GameParam } from '@/index.js';
import { COMPONENT_TYPES, ComponentInfo, ComponentType } from '@/types/component.js';
import { ComponentId } from '@/types/definition.js';
import { useState } from 'react';
import styles from './ControlPanel.module.css';
import { DeckFactory } from './factory/DeckFactory.js';
import { DiceFactory } from './factory/DiceFactory.js';

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

  // --- UI状態 (Dice/Deck 以外) ---

  // ScoreBoard関連
  const [sbPlayCard, setSbPlayCard] = useState<boolean>(true);
  const [sbHold, setSbHold] = useState<boolean>(false);
  const [sbFlip, setSbFlip] = useState<boolean>(false);
  const [sbTurnSkip, setSbTurnSkip] = useState<boolean>(true);
  const [sbRoundSkip, setSbRoundSkip] = useState<boolean>(false);

  // Token関連
  const [newTokenCount, setNewTokenCount] = useState<number>(10);

  // Draggable関連
  const [newDraggableColor, setNewDraggableColor] = useState<string>('#ff0000');
  const [uploadImage, setUploadImage] = useState<string | null>(null);

  const existingIds = existingComponents.map((c) => c.id);
  const isDuplicateId = existingIds.includes(newCompId);

  /**
   * Props生成ロジックの集約
   * DiceFactory等、外部Factoryからも参照できるように sides などの引数を拡張
   */
  const getInitialProps = (type: ComponentType, targetId: string, diceSidesOverride?: number) => {
    switch (type) {
      case 'Dice':
        const sides = diceSidesOverride || 6;
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
          image: uploadImage || '/hanabishi.svg',
          mask: true,
          color: newDraggableColor,
          size: 100,
          isDebug: true,
        };
      case 'ScoreBoard':
        return {
          playCardButton: [sbPlayCard, true],
          holdButton: [sbHold, true],
          flipButton: [sbFlip, true],
          turnSkipButton: [sbTurnSkip, true],
          roundSkipButton: [sbRoundSkip, true],
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setUploadImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleAddClick = () => {
    if (!newCompId || isDuplicateId) return;

    // Deck と Dice はそれぞれの Factory 内で完結するため、ここでは処理しない
    if (newCompType === 'Deck' || newCompType === 'Dice') return;

    const initialProps = getInitialProps(newCompType, newCompId);
    let additionalParams: Partial<GameParam> = {};

    switch (newCompType) {
      case 'TokenStore':
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

      case 'Draggable':
        additionalParams.draggables = {
          [newCompId]: {
            id: newCompId,
            coordinate: { x: 500, y: 500 },
            zIndex: 100,
            rotation: 0,
          },
        };
        break;
      case 'SystemMessageWindow':
        // PropsはgetInitialPropsで空オブジェクトが返る
        break;
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

    let additionalParams: Partial<GameParam> = {};

    // 削除対象のタイプに応じて、消すべき Record のキーを指定
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

        {/* Deck, Dice 以外の場合のみ共通追加ボタンを表示 */}
        {newCompType !== 'Deck' && newCompType !== 'Dice' && (
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
          getInitialProps={getInitialProps}
        />
      )}

      {/* --- その他の設定UI (ScoreBoard, TokenStore, Draggable) --- */}

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
              <input type="checkbox" checked={item.state} onChange={(e) => item.setter(e.target.checked)} />
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

      {newCompType === 'Draggable' && (
        <div className={styles.field} style={{ marginTop: '10px' }}>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '10px' }}>
            <div className={styles.label} style={{ fontSize: '11px', margin: 0 }}>
              色:
            </div>
            <input type="color" value={newDraggableColor} onChange={(e) => setNewDraggableColor(e.target.value)} />
          </div>

          <div className={styles.label} style={{ fontSize: '11px' }}>
            画像アップロード:
          </div>
          <input type="file" accept="image/*" className={styles.select} onChange={handleFileChange} />

          {/* ドラッグソースのプレビュー部分 */}
          <div className={styles.label} style={{ fontSize: '11px', marginTop: '10px' }}>
            プレビュー (これを盤面にドラッグ):
          </div>
          <div
            draggable
            onDragStart={(e) => {
              const id = newCompId || `drag-${Date.now()}`;
              const dragData = {
                type: 'Draggable',
                id: id,
                props: {
                  ...getInitialProps('Draggable', id),
                  slotX: 1,
                  slotY: 1,
                },
              };
              e.dataTransfer.setData('application/react-game-ui', JSON.stringify(dragData));
            }}
            className={styles.dragSourcePreview}
            style={{
              width: '80px',
              height: '80px',
              border: `2px solid ${newDraggableColor}`,
              backgroundColor: `${newDraggableColor}33`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'grab',
              borderRadius: '8px',
              overflow: 'hidden',
              position: 'relative',
              transition: 'transform 0.1s ease',
            }}
          >
            {/* アップロード画像があれば表示、なければデフォルトアイコン */}
            <img
              src={uploadImage || '/hanabishi.svg'}
              alt="preview"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                pointerEvents: 'none',
              }}
            />

            {/* IDが未入力の時のガイド */}
            {!newCompId && (
              <div
                style={{
                  position: 'absolute',
                  bottom: 0,
                  backgroundColor: 'rgba(0,0,0,0.6)',
                  color: '#fff',
                  fontSize: '9px',
                  width: '100%',
                  textAlign: 'center',
                }}
              >
                ID未設定
              </div>
            )}
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
