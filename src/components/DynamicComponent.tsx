// src/components/DynamicComponent.tsx
import { Dice } from '../components/Dice.js';
import type { ComponentType } from '../types/server.js';

interface DynamicProps {
  type: ComponentType;
  props: any;
  socket: any;
  roomId: string;
}

export const DynamicComponent = ({ type, props, socket, roomId }: DynamicProps) => {
  if (type === 'Dice') {
    return <Dice socket={socket} roomId={roomId} {...props} />;
  }

  return null;
};
