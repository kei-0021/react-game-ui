// src/gui/factory/DeckFactory.tsx
import { GameParam } from '@/index.js';
import { CardData } from '@/types/card.js';
import { ComponentInfo } from '@/types/component.js';
import { useState } from 'react';
import styles from '../ControlPanel.module.css';

const cardImages = import.meta.glob('../../assets/trump/*.png', { eager: true, import: 'default' }) as Record<
  string,
  string
>;

const getCardImage = (suit: string, num: number) => {
  const targetKey = `../../assets/trump/${suit}-${num}.png`;
  return cardImages[targetKey] || '';
};

interface DeckFactoryProps {
  newCompId: string;
  onAdd: (newComponent: ComponentInfo, additionalParams?: Partial<GameParam>) => void;
  onSuccess: () => void;
}

export const DeckFactory = ({ newCompId, onAdd, onSuccess }: DeckFactoryProps) => {
  const [deckMode, setDeckMode] = useState<'preset' | 'json'>('preset');
  const [deckJsonData, setDeckJsonData] = useState<CardData[] | null>(null);
  const [deckFileName, setDeckFileName] = useState<string>('');

  const handleJsonFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setDeckFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        setDeckJsonData(Array.isArray(json) ? json : [json]);
      } catch {
        alert('JSON解析失敗');
      }
    };
    reader.readAsText(file);
  };

  const executeAdd = () => {
    if (deckMode === 'json' && !deckJsonData) {
      alert('JSONを選択してください');
      return;
    }

    const fieldId = `${newCompId}-field`;
    const companionField: ComponentInfo = {
      id: fieldId,
      type: 'PlayField',
      props: { deckId: newCompId, title: `${newCompId}用フィールド` },
    };

    let cards: CardData[] = [];
    if (deckMode === 'preset') {
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

      cards = ['spades', 'hearts', 'diamonds', 'clubs'].flatMap((suit) =>
        [1, 2, 3, 4, 5, 6, 7].map(
          (num) =>
            ({
              ...common,
              id: `${newCompId}-${suit[0]}${num}`,
              name: `${newCompId}-${suit[0]}${num}`,
              frontImage: getCardImage(suit, num),
            }) as CardData,
        ),
      );
    } else {
      cards = deckJsonData!;
    }

    const additionalParams: Partial<GameParam> = {
      initialDecks: [{ deckId: newCompId, name: 'カード', backColor: 'black', cards }],
    };

    onAdd(companionField, {});
    onAdd({ id: newCompId, type: 'Deck', props: { deckId: newCompId, title: `山札 ${newCompId}` } }, additionalParams);
    onSuccess();
  };

  return (
    <div className={styles.field} style={{ marginTop: '10px' }}>
      <div className={styles.label} style={{ fontSize: '11px' }}>
        データ投入モード:
      </div>
      <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
        <label style={{ fontSize: '12px', color: '#fff', cursor: 'pointer' }}>
          <input type="radio" checked={deckMode === 'preset'} onChange={() => setDeckMode('preset')} /> プリセット
        </label>
        <label style={{ fontSize: '12px', color: '#fff', cursor: 'pointer' }}>
          <input type="radio" checked={deckMode === 'json'} onChange={() => setDeckMode('json')} /> JSON
        </label>
      </div>
      {deckMode === 'json' && (
        <input type="file" accept=".json" onChange={handleJsonFileChange} className={styles.select} />
      )}
      <button className={styles.saveButton} style={{ marginTop: '10px', width: '100%' }} onClick={executeAdd}>
        DeckとFieldを同時追加
      </button>
    </div>
  );
};
