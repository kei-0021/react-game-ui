// src/gui/DropContainer.tsx
import { GameParamUpdateData } from '@/types/socketData.js';
import { useCallback, useState } from 'react';
import { ComponentInfo, GameParam, RoomId } from 'react-game-ui';

interface DropContainerProps {
  scale: number;
  containerRef: React.RefObject<HTMLDivElement>;
  socket: any;
  roomId: RoomId;
  componentInfo: ComponentInfo[];
  games: GameParam[];
  setComponentInfo: (info: ComponentInfo[]) => void;
  children: React.ReactNode;
}

export function DropContainer({
  scale,
  containerRef,
  socket,
  roomId,
  componentInfo,
  games,
  setComponentInfo,
  children,
}: DropContainerProps) {
  const [previewSlot, setPreviewSlot] = useState<{ x: number; y: number } | null>(null);

  const getCanvasCoordinates = useCallback(
    (e: React.DragEvent) => {
      const canvas = containerRef.current;
      if (!canvas) return null;

      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) / scale;
      const y = (e.clientY - rect.top) / scale;

      return {
        x: Math.floor(x / 100) * 100,
        y: Math.floor(y / 100) * 100,
      };
    },
    [scale, containerRef],
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const coords = getCanvasCoordinates(e);
      if (coords) setPreviewSlot(coords);
    },
    [getCanvasCoordinates],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setPreviewSlot(null);

      const rawData = e.dataTransfer.getData('application/react-game-ui');
      if (!rawData || !socket || !roomId) return;

      try {
        const data = JSON.parse(rawData);
        const targetId = data.id || data.compId;
        const coords = getCanvasCoordinates(e);
        if (!coords || !targetId) return;

        const newComponent: ComponentInfo = {
          id: targetId,
          type: data.type,
          props: {
            ...data.props,
            draggableId: targetId,
            slotX: undefined,
            slotY: undefined,
            coordinate: { x: coords.x, y: coords.y },
          },
        };

        const updatedComponents = [...componentInfo, newComponent];
        const currentGame = games.find((g) => g.gameId === 'poker') || games[0];
        const updatedDraggables = {
          ...(currentGame?.draggables || {}),
          [targetId]: {
            id: targetId,
            coordinate: { x: coords.x, y: coords.y },
            zIndex: 100,
            rotation: 0,
          },
        };

        socket.emit('game-param:update', {
          gameId: currentGame?.gameId || 'poker',
          newParam: { draggables: updatedDraggables, components: updatedComponents },
        } as GameParamUpdateData);

        setComponentInfo(updatedComponents);
      } catch (err) {
        console.error('Drop error:', err);
      }
    },
    [socket, roomId, componentInfo, games, setComponentInfo, getCanvasCoordinates],
  );

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={() => setPreviewSlot(null)}
      onDrop={handleDrop}
      style={{
        width: '100%',
        height: '100%',
        position: 'absolute',
        top: 0,
        left: 0,
      }}
    >
      {children}
      {previewSlot && (
        <div
          style={{
            position: 'absolute',
            left: previewSlot.x,
            top: previewSlot.y,
            width: 100,
            height: 100,
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            border: '2px dashed rgba(255, 255, 255, 0.3)',
            borderRadius: '8px',
            pointerEvents: 'none',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span style={{ fontSize: '24px', opacity: 0.5 }}>＋</span>
        </div>
      )}
    </div>
  );
}
