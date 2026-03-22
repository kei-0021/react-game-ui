// tests/components/ControlPanel.tsx
import { GameMeta } from '@/types/socketData.js';
import { useEffect, useMemo, useState } from 'react';
import type { Socket } from 'socket.io-client';
import styles from './ControlPanel.module.css';

export const ControlPanel = ({ socket, gameMeta }: { socket: Socket; gameMeta: GameMeta[] }) => {
  const [selectedGameId, setSelectedGameId] = useState<string>(gameMeta[0]?.gameId || '');

  const [maxPlayers, setMaxPlayers] = useState(1);
  const [handDeckId, setHandDeckId] = useState('main');
  const [handCount, setHandCount] = useState(0);

  const [initialValues, setInitialValues] = useState({
    maxPlayers: 1,
    handDeckId: 'main',
    handCount: 0,
  });

  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // 選択中のゲームのメタデータを取得
  const selectedGame = useMemo(() => gameMeta.find((g) => g.gameId === selectedGameId), [selectedGameId, gameMeta]);

  // ゲーム選択が切り替わった時に Meta の値を同期
  useEffect(() => {
    if (selectedGame) {
      const configMaxPlayers = selectedGame.maxPlayers ?? 1;
      const configHandDeckId = selectedGame.initialHand?.deckId ?? 'main';
      const configHandCount = selectedGame.initialHand?.count ?? 0;

      const newInit = {
        maxPlayers: configMaxPlayers,
        handDeckId: configHandDeckId,
        handCount: configHandCount,
      };

      setInitialValues(newInit);
      setMaxPlayers(configMaxPlayers);
      setHandDeckId(configHandDeckId);
      setHandCount(configHandCount);
    }
  }, [selectedGame]);

  const isMaxPlayersDirty = maxPlayers !== initialValues.maxPlayers;
  const isHandDirty = handDeckId !== initialValues.handDeckId || handCount !== initialValues.handCount;

  useEffect(() => {
    const onUpdated = (data: { success: boolean }) => {
      if (data.success) {
        setIsSaving(false);
        setShowSuccess(true);
        setInitialValues({
          maxPlayers,
          handDeckId,
          handCount,
        });
        setTimeout(() => setShowSuccess(false), 2000);
      }
    };

    socket.on('game-param:updated', onUpdated);
    return () => {
      socket.off('game-param:updated', onUpdated);
    };
  }, [socket, maxPlayers, handDeckId, handCount]);

  const handleSave = () => {
    if (!socket.connected || !selectedGameId) return;

    const newParam: any = {};
    if (isMaxPlayersDirty) newParam.maxPlayers = maxPlayers;
    if (isHandDirty) {
      newParam.initialHand = {
        deckId: handDeckId,
        count: handCount,
      };
    }

    if (Object.keys(newParam).length === 0) {
      alert('変更箇所がありません');
      return;
    }

    setIsSaving(true);
    socket.emit('game-param:save', {
      gameId: selectedGameId,
      newParam,
    });
  };

  return (
    <>
      <button className={styles.hamburger} onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? '✕' : '☰'}
      </button>

      <div className={`${styles.wrapper} ${isOpen ? styles.open : ''}`}>
        <div className={styles.container}>
          <h3 className={styles.title}>コントロールパネル</h3>

          <div className={styles.field}>
            <div className={styles.label}>対象ゲームを選択:</div>
            <select
              className={styles.select}
              value={selectedGameId}
              onChange={(e) => setSelectedGameId(e.target.value)}
            >
              {gameMeta.map((game) => (
                <option key={game.gameId} value={game.gameId}>
                  {game.gameId}
                </option>
              ))}
            </select>
          </div>

          {/* selectedGame が存在する場合のみ、各フィールドの表示判定へ進む */}
          {selectedGame && (
            <>
              {/* maxPlayers プロパティが Config に定義されている場合のみ表示 */}
              {selectedGame.maxPlayers !== undefined && (
                <div className={styles.field}>
                  <div className={styles.label}>
                    <span>最大プレイヤー数: {isMaxPlayersDirty && <small>(変更あり)</small>}</span>
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
              )}

              {/* initialHand プロパティが Config に定義されている場合のみ表示 */}
              {selectedGame.initialHand !== undefined && (
                <div className={styles.field}>
                  <div className={styles.label}>
                    <span>初期手札: {isHandDirty && <small>(変更あり)</small>}</span>
                    {/* 入力ではなく表示のみにする */}
                    <strong>{handDeckId}</strong>
                  </div>

                  <div className={styles.label}>
                    <span>枚数:</span>
                    <strong>{handCount}</strong>
                  </div>

                  <input
                    type="range"
                    min="0"
                    max="10"
                    className={styles.slider}
                    value={handCount}
                    onChange={(e) => setHandCount(Number(e.target.value))}
                  />
                </div>
              )}
            </>
          )}

          <button
            className={styles.saveButton}
            onClick={handleSave}
            disabled={!socket.connected || isSaving || (!isMaxPlayersDirty && !isHandDirty)}
          >
            {isSaving ? '保存中...' : showSuccess ? '完了' : '変更箇所のみ反映'}
          </button>
        </div>
      </div>
    </>
  );
};
