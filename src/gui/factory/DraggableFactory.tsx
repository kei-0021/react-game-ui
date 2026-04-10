// src/gui/factory/DraggableFactory.tsx
import { ComponentInfo, ComponentType } from '@/types/component.js';
import { useState } from 'react';
import styles from '../ControlPanel.module.css';

interface DraggableFactoryProps {
  newCompId: string;
  onAdd: (newComponent: ComponentInfo, additionalParams?: any) => void;
  onSuccess: () => void;
  // ComponentFactory側の共通初期設定を利用
  getInitialProps: (type: ComponentType, targetId: string, overrides: any) => any;
}

export const DraggableFactory = ({ newCompId, onAdd, onSuccess, getInitialProps }: DraggableFactoryProps) => {
  const [newDraggableColor, setNewDraggableColor] = useState<string>('#ff0000');
  const [uploadImage, setUploadImage] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setUploadImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  const getOverrides = () => ({
    color: newDraggableColor,
    image: uploadImage,
  });

  const handleAdd = () => {
    const id = newCompId || `drag-${Date.now()}`;
    const initialProps = getInitialProps('Draggable', id, getOverrides());

    const additionalParams = {
      draggables: {
        [id]: {
          id: id,
          coordinate: { x: 500, y: 500 },
          zIndex: 100,
          rotation: 0,
        },
      },
    };

    onAdd({ id: id, type: 'Draggable', props: initialProps }, additionalParams);
    onSuccess();
    setUploadImage(null);
  };

  const handleDragStart = (e: React.DragEvent) => {
    const id = newCompId || `drag-${Date.now()}`;
    const dragData = {
      type: 'Draggable',
      id: id,
      props: {
        ...getInitialProps('Draggable', id, getOverrides()),
        slotX: 1,
        slotY: 1,
      },
    };
    e.dataTransfer.setData('application/react-game-ui', JSON.stringify(dragData));
  };

  return (
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

      <div className={styles.label} style={{ fontSize: '11px', marginTop: '10px' }}>
        プレビュー (これを盤面にドラッグ):
      </div>
      <div
        draggable
        onDragStart={handleDragStart}
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
          marginBottom: '10px',
        }}
      >
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

      <button className={styles.saveButton} style={{ width: '100%' }} onClick={handleAdd} disabled={!newCompId}>
        Draggableを追加
      </button>
    </div>
  );
};
