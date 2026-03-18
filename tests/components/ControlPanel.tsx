// tests/components/ControlPanel.tsx
import { useState } from 'react';
import type { Socket } from 'socket.io-client';
import styles from './ControlPanel.module.css';

export const ControlPanel = ({ socket, gameId }: { socket: Socket; gameId: string }) => {
  const [maxPlayers, setMaxPlayers] = useState(1);
  const [isOpen, setIsOpen] = useState(false);

  const handleSave = () => {
    if (!socket.connected) {
      alert('サーバーと繋がってない');
      return;
    }

    socket.emit('game-param:update', {
      gameId: gameId,
      newParam: {
        gameId,
        maxPlayers,
        initialDecks: [],
        draggable: {},
      },
    });
  };

  return (
    <>
      {/* ハンバーガーボタン */}
      <button className={styles.hamburger} onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? '✕' : '☰'}
      </button>

      {/* 外枠（isOpen によって styles.open を付与） */}
      <div className={`${styles.wrapper} ${isOpen ? styles.open : ''}`}>
        <div className={styles.container}>
          <h3 className={styles.title}>コントロールパネル ({gameId})</h3>

          <div className={styles.field}>
            <div className={styles.label}>
              <span>最大プレイヤー数:</span>
              <strong>{maxPlayers}</strong>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              className={styles.slider}
              value={maxPlayers}
              onChange={(e) => setMaxPlayers(Number(e.target.value))}
            />
          </div>

          <button className={styles.saveButton} onClick={handleSave} disabled={!socket.connected}>
            コードに上書き反映
          </button>
        </div>
      </div>
    </>
  );
};
