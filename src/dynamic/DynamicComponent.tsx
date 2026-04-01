// src/dynamic/DynamicComponent.tsx
import { GridBoard, Player, ScoreBoard, SystemMessageWindow } from '@/index.js';
import { PlayerId, RoomId } from '@/types/definition.js';
import { useEffect } from 'react';
import type { Socket } from 'socket.io-client';
import { Deck } from '../components/Deck.js';
import { Dice } from '../components/Dice.js';
import { Draggable } from '../components/Draggable.js';
import { PlayField } from '../components/PlayField.js';
import { Timer } from '../components/Timer.js';
import { TokenStore } from '../components/TokenStore.js';
import type { ComponentInfo } from '../types/server.js';

interface DynamicComponentProps {
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
}: DynamicComponentProps) => {
  useEffect(() => {
    console.log('DynamicComponent: mount', props);
    return () => console.log('DynamicComponent: unmount', props);
  }, []);

  // 共通の Props をまとめておく
  const commonProps = { socket, roomId };

  switch (type) {
    case 'Deck':
      return <Deck {...commonProps} {...props} myPlayerId={myPlayerId} currentPlayerId={currentPlayerId} />;

    case 'PlayField':
      return <PlayField {...commonProps} {...props} myPlayerId={myPlayerId} players={players} isDebug={true} />;

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
