// src/gui/ComponentFactory.tsx
import { CardData } from '@/types/card.js';
import { ComponentId } from '@/types/definition.js';
import { COMPONENT_TYPES, ComponentInfo, ComponentType } from '@/types/server.js';
import { GameMeta } from '@/types/socketData.js';
import { useState } from 'react';
import styles from './ControlPanel.module.css';

const cardImages = import.meta.glob('../assets/trump/*.png', { eager: true, import: 'default' }) as Record<
  string,
  string
>;

const getCardImage = (suit: string, num: number) => {
  // globに渡したベースパスと引数を完全に一致させる
  const targetKey = `../assets/trump/${suit}-${num}.png`;

  // 完全一致で引き当てる
  return cardImages[targetKey] || '';
};

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

  // Deck関連
  const [deckMode, setDeckMode] = useState<'preset' | 'json'>('preset');
  const [deckJsonData, setDeckJsonData] = useState<CardData[] | null>(null);
  const [deckFileName, setDeckFileName] = useState<string>('');

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

  const existingIds = existingComponents.map((c) => c.id);
  const isDuplicateId = existingIds.includes(newCompId);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setUploadImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleJsonFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setDeckFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        setDeckJsonData(Array.isArray(json) ? json : [json]);
      } catch (err) {
        alert('JSONファイルの解析に失敗しました。形式を確認してください。');
        setDeckJsonData(null);
      }
    };
    reader.readAsText(file);
  };

  const handleAddClick = () => {
    if (!newCompId || isDuplicateId) return;

    let initialProps: Record<string, any> = {};
    let additionalParams: Partial<GameMeta> = {};

    switch (newCompType) {
      case 'Deck':
        initialProps = {
          deckId: newCompId,
          title: `山札 ${newCompId}`,
        };

        let cards: CardData[] = [];

        if (deckMode === 'preset') {
          // プリセット（既存の共通化ロジック）
          const common: Partial<CardData> = {
            deckId: newCompId,
            ownerId: null,
            location: 'deck',
            drawCondition: ['hand', 'back'],
            fieldBackCondition: ['discard', 'face'],
            playLocation: 'field',
            isFaceUp: true,
            backColor: 'black',
          };

          const suits = ['spades', 'hearts', 'diamonds', 'clubs'].flatMap((suit) =>
            [1, 2].map((num) => ({
              suffix: `${suit[0]}${num}`,
              img: getCardImage(suit, num),
            })),
          );

          cards = suits.map(
            (suit) =>
              ({
                ...common,
                id: `${newCompId}-${suit.suffix}`,
                name: `${newCompId}-${suit.suffix}`,
                frontImage: suit.img,
              }) as CardData,
          );
        } else {
          if (!deckJsonData) {
            alert('JSONファイルを選択してください');
            return;
          }
          cards = deckJsonData;
        }

        additionalParams.initialDecks = [
          {
            deckId: newCompId,
            name: 'カード',
            backColor: 'black',
            cards: cards,
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

      {/* Deck専用の設定項目 */}
      {newCompType === 'Deck' && (
        <div className={styles.field} style={{ marginTop: '10px' }}>
          <div className={styles.label} style={{ fontSize: '11px' }}>
            データ投入モード:
          </div>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
            <label style={{ fontSize: '12px', color: '#fff', cursor: 'pointer' }}>
              <input
                type="radio"
                name="deckMode"
                checked={deckMode === 'preset'}
                onChange={() => setDeckMode('preset')}
              />{' '}
              プリセット (トランプ)
            </label>
            <label style={{ fontSize: '12px', color: '#fff', cursor: 'pointer' }}>
              <input type="radio" name="deckMode" checked={deckMode === 'json'} onChange={() => setDeckMode('json')} />{' '}
              JSONファイル
            </label>
          </div>

          {deckMode === 'json' && (
            <div>
              <input type="file" accept=".json" onChange={handleJsonFileChange} className={styles.select} />
              {deckFileName && (
                <div style={{ fontSize: '10px', color: '#0f0', marginTop: '4px' }}>
                  読み込み完了: {deckFileName} ({deckJsonData?.length}枚)
                </div>
              )}
            </div>
          )}
        </div>
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
            onDragStart={(e) => {
              const dragData = {
                type: 'Dice',
                id: newCompId || `dice-${Date.now()}`,
                props: {
                  diceId: newCompId || `dice-${Date.now()}`,
                  sides: newDiceSides,
                  title: `${newDiceSides}面ダイス`,
                  slotX: 1,
                  slotY: 1,
                },
              };
              e.dataTransfer.setData('application/react-game-ui', JSON.stringify(dragData));
            }}
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
            }}
          >
            <span style={{ fontSize: '20px' }}>🎲</span>
            <span style={{ fontSize: '10px', color: '#ccc' }}>{newDiceSides}面</span>
          </div>
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

          {/* ドラッグソースのプレビュー部分 */}
          <div className={styles.label} style={{ fontSize: '11px', marginTop: '10px' }}>
            プレビュー (これを盤面にドラッグ):
          </div>
          <div
            draggable
            onDragStart={(e) => {
              const dragData = {
                type: 'Draggable',
                id: newCompId || `drag-${Date.now()}`,
                props: {
                  image: uploadImage || '/hanabishi.svg',
                  color: newDraggableColor,
                  size: 80,
                },
              };
              e.dataTransfer.setData('application/react-game-ui', JSON.stringify(dragData));
            }}
            className={styles.dragSourcePreview}
            style={{
              width: '80px',
              height: '80px',
              border: `2px solid ${newDraggableColor}`,
              backgroundColor: `${newDraggableColor}33`, // 少し透明度を下げた背景
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
                pointerEvents: 'none', // imgタグがドラッグイベントを邪魔しないように
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
