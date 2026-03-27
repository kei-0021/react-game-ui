// src/components/DynamicComponent.tsx
import { RoomId } from '@/types/definition.js';
import type { Socket } from 'socket.io-client';
import { Deck } from '../components/Deck.js';
import { Dice } from '../components/Dice.js';
import { Timer } from '../components/Timer.js';
import type { ComponentInfo } from '../types/server.js';
import { Draggable } from './Draggable.js';

interface DynamicProps {
  type: ComponentInfo['type'];
  props: any;
  socket: Socket;
  roomId: RoomId;
}

export const DynamicComponent = ({ type, props, socket, roomId }: DynamicProps) => {
  // 共通の Props をまとめておく
  const commonProps = { socket, roomId };

  switch (type) {
    case 'Draggable':
      return <Draggable {...commonProps} {...props} />;

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
