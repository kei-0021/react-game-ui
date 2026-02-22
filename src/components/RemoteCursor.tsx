import React, { useEffect, useState } from "react";
import type { Socket } from "socket.io-client";
import type { PlayerId, RoomId } from "../types/definition.js";
import styles from "./RemoteCursor.module.css";

type RemoteCursorCoords = { x: number; y: number };

interface Props {
  socket: Socket | null;
  roomId: RoomId | undefined;
  myPlayerId: PlayerId | null;
  players: { name: string; socketId: string; color?: string }[];
  scale: number;
  fixedContainerRef: React.RefObject<HTMLDivElement>;
  visible: boolean;
  isRelative?: boolean;
}

export const RemoteCursor = React.memo(
  ({
    socket,
    roomId,
    myPlayerId,
    players,
    scale,
    fixedContainerRef,
    visible,
    isRelative = true,
  }: Props) => {
    const [remoteCursors, setRemoteCursors] = useState<
      Record<string, RemoteCursorCoords>
    >({});

    useEffect(() => {
      if (!socket) return;

      const handleUpdate = (data: {
        playerId: string;
        x: number;
        y: number;
      }) => {
        if (data.playerId === socket.id || data.playerId === myPlayerId) return;

        setRemoteCursors((prev) => ({
          ...prev,
          [data.playerId]: { x: data.x, y: data.y },
        }));
      };

      socket.on("cursor:update", handleUpdate);
      return () => {
        socket.off("cursor:update", handleUpdate);
      };
    }, [socket, myPlayerId]);

    useEffect(() => {
      if (!socket || !roomId || !myPlayerId || !fixedContainerRef.current)
        return;

      const THROTTLE = 50;
      let lastTime = 0;

      const handleMove = (e: MouseEvent) => {
        const now = Date.now();
        if (now - lastTime < THROTTLE) return;
        lastTime = now;

        const rect = fixedContainerRef.current!.getBoundingClientRect();

        const x = isRelative
          ? (e.clientX - rect.left) / rect.width
          : (e.clientX - rect.left) / scale;
        const y = isRelative
          ? (e.clientY - rect.top) / rect.height
          : (e.clientY - rect.top) / scale;

        socket.emit("cursor:move", {
          roomId,
          playerId: myPlayerId,
          x,
          y,
        });
      };

      window.addEventListener("mousemove", handleMove);
      return () => window.removeEventListener("mousemove", handleMove);
    }, [socket, roomId, myPlayerId, scale, fixedContainerRef, isRelative]);

    if (!visible) return null;

    return (
      <div className={styles.container}>
        {Object.entries(remoteCursors).map(([id, coords]) => {
          const player =
            players.find((p) => String(p.socketId) === String(id)) ||
            players.find((p) => p.socketId !== myPlayerId);

          const name = player ? player.name : "接続中...";
          const color = player?.color || "#000000";

          const left = isRelative ? `${coords.x * 100}%` : coords.x;
          const top = isRelative ? `${coords.y * 100}%` : coords.y;

          return (
            <div
              key={id}
              className={styles.cursorWrapper}
              style={{ left, top }}
            >
              <div className={styles.icon} style={{ color: color }}>
                👆
              </div>
              <div className={styles.label} style={{ backgroundColor: color }}>
                {name}
              </div>
            </div>
          );
        })}
      </div>
    );
  },
);
