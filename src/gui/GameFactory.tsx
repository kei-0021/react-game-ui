// src/gui/GameFactory.tsx
import { GameParam } from '@/types/gameParam.js';
import { GameCreateData, GameDeleteData } from '@/types/socketData.js';
import { useState } from 'react';
import type { Socket } from 'socket.io-client';
import styles from './ControlPanel.module.css';

interface GameFactoryProps {
  socket: Socket;
  GameParam: GameParam[];
  selectedGameId: string;
  onSelect: (gameId: string) => void;
}

export const GameFactory = ({ socket, GameParam, selectedGameId, onSelect }: GameFactoryProps) => {
  const [newGameName, setNewGameName] = useState('');
  const [newGameIcon, setNewGameIcon] = useState('🎲');
  const [isDeleteMode, setIsDeleteMode] = useState(false);

  const handleCreateGame = () => {
    if (!newGameName || !socket.connected) return;
    const sanitizedGameId = newGameName.toLowerCase().replace(/[^a-z]/g, '');
    if (!sanitizedGameId) return;

    socket.emit('game:create', {
      gameName: sanitizedGameId,
      gameIcon: newGameIcon || '🎲',
    } as GameCreateData);

    setNewGameName('');
  };

  const handleDeleteGame = () => {
    if (!selectedGameId || !socket.connected) return;
    if (window.confirm(`ゲーム「${selectedGameId}」を削除しますか？`)) {
      socket.emit('game:delete', { gameId: selectedGameId } as GameDeleteData);
      setIsDeleteMode(false);
    }
  };

  return (
    <div className={styles.gameFactoryBox}>
      {/* 新規作成セクション */}
      <div className={styles.field}>
        <div className={styles.label}>新規ゲーム作成:</div>
        <div className={styles.createSection}>
          <input
            type="text"
            className={`${styles.select} ${styles.iconInput}`}
            placeholder="Icon"
            value={newGameIcon}
            onChange={(e) => setNewGameIcon(e.target.value.slice(0, 5))}
          />
          <input
            type="text"
            className={`${styles.select} ${styles.flexFill}`}
            placeholder="Game ID (英小文字)"
            value={newGameName}
            onChange={(e) => setNewGameName(e.target.value)}
          />
          <button
            className={`${styles.saveButton} ${styles.createButton}`}
            onClick={handleCreateGame}
            disabled={!newGameName}
          >
            作成
          </button>
        </div>
      </div>

      <hr className={styles.divider} />

      {/* ゲーム選択セクション */}
      <div className={styles.field}>
        <div className={styles.rangeHeader}>
          <div className={styles.label}>対象ゲームを選択:</div>
          <button
            onClick={() => setIsDeleteMode(!isDeleteMode)}
            className={styles.deleteModeBtn}
            style={{ color: isDeleteMode ? '#ff4444' : '#888', fontSize: '11px' }}
          >
            {isDeleteMode ? 'キャンセル' : '削除モード'}
          </button>
        </div>
        <div className={styles.createSection}>
          <select
            className={`${styles.select} ${styles.flexFill}`}
            value={selectedGameId}
            onChange={(e) => onSelect(e.target.value)}
          >
            {GameParam.length === 0 && <option value="">読み込み中...</option>}
            {GameParam.map((game) => (
              <option key={game.gameId} value={game.gameId}>
                {game.gameIcon} {game.gameId}
              </option>
            ))}
          </select>
          {isDeleteMode && selectedGameId && (
            <button
              className={styles.saveButton}
              onClick={handleDeleteGame}
              style={{ background: '#ff4444', border: 'none' }}
            >
              削除
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
