// tests/components/ControlPanel.tsx
import { useEffect, useState } from 'react';
import type { Socket } from 'socket.io-client';
import styles from './ControlPanel.module.css';

export const ControlPanel = ({ socket, gameIds }: { socket: Socket; gameIds: string[] }) => {
  // 保存済みの基準値
  const [initialValues, setInitialValues] = useState({
    maxPlayers: 1,
    handDeckId: 'main',
    handCount: 0,
  });

  const [selectedGameId, setSelectedGameId] = useState(gameIds[0] || '');

  const [maxPlayers, setMaxPlayers] = useState(1);
  const [handDeckId, setHandDeckId] = useState('main');
  const [handCount, setHandCount] = useState(0);

  // フラグは State ではなく、その場で計算
  const isMaxPlayersDirty = maxPlayers !== initialValues.maxPlayers;
  const isHandDirty = handDeckId !== initialValues.handDeckId || handCount !== initialValues.handCount;

  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    // サーバーからの「更新完了」通知をリッスン
    const onUpdated = (data: { success: boolean }) => {
      if (data.success) {
        setIsSaving(false);
        setShowSuccess(true);
        // 保存できたら、現在の値を新しい「基準値」としてセット
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

    // 本当に変更があったものだけを詰める
    const newParam: any = {};

    if (isMaxPlayersDirty) {
      newParam.maxPlayers = maxPlayers;
    }

    if (isHandDirty) {
      newParam.initialHand = {
        deckId: handDeckId,
        count: handCount,
      };
    }

    // 何も変えていないなら送らない
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
      {/* ハンバーガーボタン */}
      <button className={styles.hamburger} onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? '✕' : '☰'}
      </button>

      {/* 外枠（isOpen によって styles.open を付与） */}
      <div className={`${styles.wrapper} ${isOpen ? styles.open : ''}`}>
        <div className={styles.container}>
          <h3 className={styles.title}>コントロールパネル</h3>

          <div className={styles.field}>
            <div className={styles.label}>対象ゲームを選択:</div>
            <select
              className={styles.select}
              value={selectedGameId}
              onChange={(e) => {
                setSelectedGameId(e.target.value);
                // 本来はここで選択したゲームの初期値をサーバーから取ってきて setInitialValues するのがベスト
              }}
            >
              {gameIds.map((id) => (
                <option key={id} value={id}>
                  {id}
                </option>
              ))}
            </select>
          </div>

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
              onChange={(e) => {
                setMaxPlayers(Number(e.target.value));
              }}
            />
          </div>

          {/* 初期手札設定 */}
          <div className={styles.field}>
            <div className={styles.label}>
              <span>初期手札: {isHandDirty && <small>(変更あり)</small>}</span>
            </div>
            <input
              type="text"
              className={styles.input}
              value={handDeckId}
              onChange={(e) => {
                setHandDeckId(e.target.value);
              }}
            />
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
              onChange={(e) => {
                setHandCount(Number(e.target.value));
              }}
            />
          </div>

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
