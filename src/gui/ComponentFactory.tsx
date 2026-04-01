// src/gui/ComponentFactory.tsx
import { ComponentId } from '@/types/definition.js';
import { COMPONENT_TYPES, ComponentInfo, ComponentType } from '@/types/server.js';
import { GameMeta } from '@/types/socketData.js';
import { useState } from 'react';
import styles from './ControlPanel.module.css';

interface ComponentFactoryProps {
  onAdd: (newComponent: ComponentInfo, additionalParams?: any) => void;
  existingIds: ComponentId[];
  containerRef: React.RefObject<HTMLElement | null>;
}

export const ComponentFactory = ({ onAdd, existingIds, containerRef }: ComponentFactoryProps) => {
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
  const [uploadImage, setUploadImage] = useState<string | null>(null);
  const [newDraggableX, setNewDraggableX] = useState<number>(500);
  const [newDraggableY, setNewDraggableY] = useState<number>(500);
  const [isDraggingPreview, setIsDraggingPreview] = useState(false);

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
          deckId: `deck`,
          title: '山札',
        };
        additionalParams.initialDecks = [
          {
            deckId: `deck`,
            name: 'カード',
            backColor: 'black',
            cards: [
              {
                id: '1',
                deckId: `deck`,
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
          deckId: `deck`,
          title: `deck`,
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

        const generatedTokens = Array.from({ length: newTokenCount }, (_, i) => ({
          id: `${newCompId}-s${i + 1}`,
          name: '💰',
          color: '#D4AF37',
        }));

        additionalParams.initialTokenStores = [
          {
            tokenStoreId: newCompId,
            name: newCompId,
            tokens: generatedTokens,
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
            coordinate: { x: newDraggableX, y: newDraggableY },
            zIndex: 100,
            rotation: 0,
          },
        };
        break;
      case 'Dice':
        initialProps = {
          diceId: `dice-${newCompId}`,
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
          <div className={styles.label} style={{ fontSize: '11px' }}>
            画像アップロード:
          </div>
          <input type="file" accept="image/*" className={styles.select} onChange={handleFileChange} />

          <div style={{ marginTop: '10px', fontSize: '11px', color: '#aaa' }}>
            ※画面上の赤いプレビューをドラッグして初期位置を決めてください
          </div>

          {/* プレビュー用の簡易D&D要素 (本来はPortal等で盤面上に表示するのが理想) */}
          <div
            style={{
              position: 'fixed',
              // 保存されている「相対座標」に、「現在の盤面の物理位置」を足して描画する
              left: `${(containerRef.current?.getBoundingClientRect().left || 0) + newDraggableX}px`,
              top: `${(containerRef.current?.getBoundingClientRect().top || 0) + newDraggableY}px`,
              width: '50px',
              height: '50px',
              border: '2px dashed #ff4444',
              backgroundColor: 'rgba(255, 68, 68, 0.3)',
              cursor: 'move',
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'auto',
            }}
            onMouseDown={(e) => {
              setIsDraggingPreview(true);
              const rect = containerRef.current?.getBoundingClientRect();
              if (!rect) return;

              const startX = e.clientX - newDraggableX - rect.left;
              const startY = e.clientY - newDraggableY - rect.top;

              const onMouseMove = (moveEvent: MouseEvent) => {
                // 物理座標から「部屋の左上」と「最初のズレ」を引いて相対座標を出す
                setNewDraggableX(moveEvent.clientX - rect.left - startX);
                setNewDraggableY(moveEvent.clientY - rect.top - startY);
              };

              const onMouseUp = () => {
                setIsDraggingPreview(false);
                document.removeEventListener('mousemove', onMouseMove);
                document.removeEventListener('mouseup', onMouseUp);
              };

              document.addEventListener('mousemove', onMouseMove);
              document.addEventListener('mouseup', onMouseUp);
            }}
          >
            <span style={{ fontSize: '10px', color: 'white', userSelect: 'none' }}>Preview</span>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '10px', fontSize: '11px' }}>
            <span>X: {Math.round(newDraggableX)}</span>
            <span>Y: {Math.round(newDraggableY)}</span>
          </div>
        </div>
      )}
    </div>
  );
};
