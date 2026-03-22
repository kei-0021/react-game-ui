// tests/components/ControlPanel.tsx
import { GameMeta } from '@/types/socketData.js';
import { useEffect, useMemo, useState } from 'react';
import type { Socket } from 'socket.io-client';
import styles from './ControlPanel.module.css';

export const ControlPanel = ({
  socket,
  gameMeta,
  isOpen,
  onToggle,
}: {
  socket: Socket;
  gameMeta: GameMeta[];
  isOpen: boolean;
  onToggle: () => void;
}) => {
  const [selectedGameId, setSelectedGameId] = useState<string>('');
  const [maxPlayers, setMaxPlayers] = useState(1);
  const [initialHand, setInitialHand] = useState<Record<string, number>>({});
  const [initialTokens, setInitialTokens] = useState<Record<string, number>>({});

  const [initialValues, setInitialValues] = useState<{
    maxPlayers: number;
    initialHand: Record<string, number>;
    initialTokens: Record<string, number>;
  }>({
    maxPlayers: 1,
    initialHand: {},
    initialTokens: {},
  });

  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (gameMeta.length > 0 && !selectedGameId) {
      setSelectedGameId(gameMeta[0].gameId);
    }
  }, [gameMeta, selectedGameId]);

  const selectedGame = useMemo(() => gameMeta.find((g) => g.gameId === selectedGameId), [selectedGameId, gameMeta]);

  useEffect(() => {
    if (selectedGame) {
      const configMaxPlayers = selectedGame.maxPlayers ?? 1;
      const configInitialHand = selectedGame.initialHand ?? {};
      const configInitialTokens = selectedGame.initialTokens ?? {};

      setInitialValues({
        maxPlayers: configMaxPlayers,
        initialHand: { ...configInitialHand },
        initialTokens: { ...configInitialTokens },
      });
      setMaxPlayers(configMaxPlayers);
      setInitialHand({ ...configInitialHand });
      setInitialTokens({ ...configInitialTokens });
    }
  }, [selectedGame]);

  const isMaxPlayersDirty = maxPlayers !== initialValues.maxPlayers;
  const isHandDirty = JSON.stringify(initialHand) !== JSON.stringify(initialValues.initialHand);
  const isTokensDirty = JSON.stringify(initialTokens) !== JSON.stringify(initialValues.initialTokens);

  useEffect(() => {
    const onUpdated = (data: { success: boolean }) => {
      if (data.success) {
        setIsSaving(false);
        setShowSuccess(true);
        setInitialValues({
          maxPlayers,
          initialHand: { ...initialHand },
          initialTokens: { ...initialTokens },
        });
        setTimeout(() => setShowSuccess(false), 2000);
      }
    };

    socket.on('game-param:updated', onUpdated);

    return () => {
      socket.off('game-param:updated', onUpdated);
    };
  }, [socket, maxPlayers, initialHand, initialTokens]);

  const handleSave = () => {
    if (!socket.connected || !selectedGameId) return;

    const newParam: Partial<GameMeta> = {};
    if (isMaxPlayersDirty) newParam.maxPlayers = maxPlayers;
    if (isHandDirty) newParam.initialHand = initialHand;
    if (isTokensDirty) newParam.initialTokens = initialTokens;

    if (Object.keys(newParam).length === 0) return;

    setIsSaving(true);
    socket.emit('game-param:save', {
      gameId: selectedGameId,
      newParam,
    });
  };

  return (
    <>
      <button className={styles.hamburger} onClick={onToggle}>
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
              {gameMeta.length === 0 && <option value="">読み込み中...</option>}
              {gameMeta.map((game) => (
                <option key={game.gameId} value={game.gameId}>
                  {game.gameId}
                </option>
              ))}
            </select>
          </div>

          {selectedGame && (
            <>
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

              {/* initialHand 内の全エントリーを map で回して表示 */}
              {Object.entries(initialHand).map(([deckId, count]) => (
                <div key={`hand-${deckId}`} className={styles.field}>
                  <div className={styles.label}>
                    <span>
                      <strong>Hand: {deckId}</strong>
                    </span>
                    {initialValues.initialHand[deckId] !== count && <small> (変更あり)</small>}
                  </div>
                  <div className={styles.label}>
                    <span>初期手札枚数:</span>
                    <strong>{count}</strong>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    className={styles.slider}
                    value={count}
                    onChange={(e) => {
                      setInitialHand({
                        ...initialHand,
                        [deckId]: Number(e.target.value),
                      });
                    }}
                  />
                </div>
              ))}

              {Object.entries(initialTokens).map(([tokenId, count]) => (
                <div key={`token-${tokenId}`} className={styles.field}>
                  <div className={styles.label}>
                    <span>
                      <strong>Token: {tokenId}</strong>
                    </span>
                    {initialValues.initialTokens[tokenId] !== count && <small> (変更あり)</small>}
                  </div>
                  <div className={styles.label}>
                    <span>初期トークン数:</span>
                    <strong>{count}</strong>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    className={styles.slider}
                    value={count}
                    onChange={(e) => {
                      setInitialTokens({
                        ...initialTokens,
                        [tokenId]: Number(e.target.value),
                      });
                    }}
                  />
                </div>
              ))}
            </>
          )}

          <button
            className={styles.saveButton}
            onClick={handleSave}
            disabled={!socket.connected || isSaving || (!isMaxPlayersDirty && !isHandDirty && !isTokensDirty)}
          >
            {isSaving ? '保存中...' : showSuccess ? '完了' : '変更箇所のみ反映'}
          </button>
        </div>
      </div>
    </>
  );
};
