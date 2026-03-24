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
  const [newGameName, setNewGameName] = useState('');

  // 各種パラメータの状態
  const [maxPlayers, setMaxPlayers] = useState(1);
  const [initialHand, setInitialHand] = useState<Record<string, number>>({});
  const [initialTokens, setInitialTokens] = useState<Record<string, number>>({});

  // 比較用の初期値保持
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
  const [isDeleteMode, setIsDeleteMode] = useState(false);

  // ゲーム選択の初期化
  useEffect(() => {
    if (gameMeta.length > 0 && !selectedGameId) {
      setSelectedGameId(gameMeta[0].gameId);
    }
  }, [gameMeta, selectedGameId]);

  const selectedGame = useMemo(() => gameMeta.find((g) => g.gameId === selectedGameId), [selectedGameId, gameMeta]);

  // 選択ゲームが変わった時にフォーム値を更新
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

  // 変更検知
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

    const onCreated = (data: { success: boolean; gameId: string }) => {
      if (data.success) {
        setSelectedGameId(data.gameId);
        setNewGameName('');
      }
    };

    const onDeleted = (data: { success: boolean; gameId: string }) => {
      if (data.success) {
        setIsDeleteMode(false);
        if (selectedGameId === data.gameId) {
          const nextGame = gameMeta.find((g) => g.gameId !== data.gameId);
          setSelectedGameId(nextGame ? nextGame.gameId : '');
        }
      }
    };

    socket.on('game-param:updated', onUpdated);
    socket.on('game:created', onCreated);
    socket.on('game:deleted', onDeleted);

    return () => {
      socket.off('game-param:updated', onUpdated);
      socket.off('game:created', onCreated);
      socket.off('game:deleted', onDeleted);
    };
  }, [socket, maxPlayers, initialHand, initialTokens, selectedGameId, gameMeta]);

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

  const handleCreateGame = () => {
    if (!newGameName || !socket.connected) return;
    socket.emit('game:create', { gameName: newGameName, gameIcon: '🆕' });
  };

  const handleDeleteGame = () => {
    if (!selectedGameId || !socket.connected) return;
    if (window.confirm(`ゲーム「${selectedGameId}」を削除しますか？`)) {
      socket.emit('game:delete', { gameId: selectedGameId });
    }
  };

  return (
    <>
      <button className={styles.hamburger} onClick={onToggle}>
        {isOpen ? '✕' : '☰'}
      </button>

      <div className={`${styles.wrapper} ${isOpen ? styles.open : ''}`}>
        <div className={styles.container}>
          <h3 className={styles.title}>コントロールパネル</h3>

          {/* 新規作成セクション */}
          <div className={styles.field}>
            <div className={styles.label}>新規ゲーム作成:</div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                className={styles.select}
                style={{ flex: 1 }}
                placeholder="GameName 🎲"
                value={newGameName}
                onChange={(e) => setNewGameName(e.target.value)}
              />
              <button
                className={styles.saveButton}
                onClick={handleCreateGame}
                style={{ marginTop: 0, padding: '0 15px', whiteSpace: 'nowrap' }}
                disabled={!newGameName}
              >
                作成
              </button>
            </div>
          </div>

          <hr className={styles.divider} style={{ margin: '20px 0', border: 'none', borderTop: '1px solid #444' }} />

          {/* ゲーム選択セクション */}
          <div className={styles.field}>
            <div
              className={styles.label}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
            >
              <span>対象ゲームを選択:</span>
              <button
                onClick={() => setIsDeleteMode(!isDeleteMode)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: isDeleteMode ? '#ff4444' : '#888',
                  cursor: 'pointer',
                  fontSize: '12px',
                }}
              >
                {isDeleteMode ? 'キャンセル' : '削除モード'}
              </button>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <select
                className={styles.select}
                style={{ flex: 1 }}
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
              {isDeleteMode && selectedGameId && (
                <button
                  className={styles.saveButton}
                  onClick={handleDeleteGame}
                  style={{
                    marginTop: 0,
                    padding: '0 15px',
                    background: '#ff4444',
                    border: 'none',
                    whiteSpace: 'nowrap',
                  }}
                >
                  削除
                </button>
              )}
            </div>
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

              {Object.entries(initialHand).map(([deckId, count]) => (
                <div key={`hand-${deckId}`} className={styles.field}>
                  <div className={styles.label}>
                    <span>
                      <strong>Hand: {deckId}</strong>
                    </span>
                    {initialValues.initialHand[deckId] !== count && <small> (変更あり)</small>}
                  </div>
                  <div className={styles.label}>
                    <span>枚数:</span>
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
                    <span>個数:</span>
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
