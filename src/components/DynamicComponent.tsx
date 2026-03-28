// src/components/DynamicComponent.tsx
import { GridBoard, Player, ScoreBoard, SystemMessageWindow } from '@/index.js';
import { PlayerId, RoomId } from '@/types/definition.js';
import type { Socket } from 'socket.io-client';
import { Deck } from '../components/Deck.js';
import { Dice } from '../components/Dice.js';
import { Timer } from '../components/Timer.js';
import type { ComponentInfo } from '../types/server.js';
import { Draggable } from './Draggable.js';
import { PlayField } from './PlayField.js';
import { TokenStore } from './TokenStore.js';

interface DynamicProps {
  type: ComponentInfo['type'];
  props: any;
  socket: Socket;
  roomId: RoomId;
  myPlayerId: PlayerId;
  currentPlayerId: PlayerId;
  players: Player[];
  containerRef: any;
}

export const DynamicComponent = ({
  type,
  props,
  socket,
  roomId,
  myPlayerId,
  currentPlayerId,
  players,
  containerRef,
}: DynamicProps) => {
  // 共通の Props をまとめておく
  const commonProps = { socket, roomId };

  switch (type) {
    case 'Deck':
      return <Deck {...commonProps} {...props} />;

    case 'PlayField':
      return <PlayField {...commonProps} {...props} myPlayerId={myPlayerId} players={players} />;

    case 'ScoreBoard':
      return (
        <ScoreBoard
          {...commonProps}
          {...props}
          myPlayerId={myPlayerId}
          currentPlayerId={currentPlayerId}
          players={players}
        />
      );

    case 'TokenStore':
      return <TokenStore {...commonProps} {...props} />;

    case 'GridBoard':
      return <GridBoard {...commonProps} {...props} />;

    case 'Draggable':
      return <Draggable {...commonProps} {...props} containerRef={containerRef} />;

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

    case 'SystemMessageWindow':
      return <SystemMessageWindow {...commonProps} />;

    // 未定義のコンポーネントが来た場合
    default:
      console.warn(`Unknown component type: ${type}`);
      return null;
  }
};
