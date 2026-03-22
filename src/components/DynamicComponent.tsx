// src/components/DynamicComponent.tsx
import { Deck } from '../components/Deck.js'; // 順次追加
import { Dice } from '../components/Dice.js';
import { Timer } from '../components/Timer.js'; // 順次追加
import type { ComponentInfo } from '../types/server.js';

interface DynamicProps {
  type: ComponentInfo['type'];
  props: any;
  socket: any;
  roomId: string;
  // 必要に応じて共通で渡すべき state などを追加
}

export const DynamicComponent = ({ type, props, socket, roomId }: DynamicProps) => {
  // 共通の Props をまとめておく
  const commonProps = { socket, roomId };

  switch (type) {
    case 'Dice':
      const processedProps = { ...props };

      if (Array.isArray(props.customFaces)) {
        processedProps.customFaces = props.customFaces.map((src: string, i: number) => (
          <img key={`f${i}`} src={src} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        ));
      }

      return <Dice {...commonProps} {...processedProps} />;

    case 'Timer':
      return <Timer {...commonProps} {...props} />;

    case 'Deck':
      return <Deck {...commonProps} {...props} />;

    // 未定義のコンポーネントが来た場合
    default:
      console.warn(`Unknown component type: ${type}`);
      return null;
  }
};
