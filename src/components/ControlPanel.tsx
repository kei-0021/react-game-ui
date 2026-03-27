// src/components/ControlPanel.tsx
import { ComponentInfo } from '@/types/server.js';
import { GameCreateData, GameDeleteData, GameMeta, GameParamUpdateData } from '@/types/socketData.js';
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
  const [newGameIcon, setNewGameIcon] = useState('🎲');

  // 新規コンポーネント追加用の状態
  const [newCompId, setNewCompId] = useState('');
  const [newCompType, setNewCompType] = useState<'Dice'>('Dice');

  // 各種パラメータの状態
  const [maxPlayers, setMaxPlayers] = useState(1);
  const [initialHand, setInitialHand] = useState<Record<string, number>>({});
  const [initialTokens, setInitialTokens] = useState<Record<string, number>>({});
  // コンポーネントのローカル状態
  const [localComponents, setLocalComponents] = useState<ComponentInfo[]>([]);

  // 比較用の初期値保持
  const [initialValues, setInitialValues] = useState<{
    maxPlayers: number;
    initialHand: Record<string, number>;
    initialTokens: Record<string, number>;
    components: ComponentInfo[];
  }>({
    maxPlayers: 1,
    initialHand: {},
    initialTokens: {},
    components: [],
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

  // 変更検知
  const isMaxPlayersDirty = maxPlayers !== initialValues.maxPlayers;
  const isHandDirty = JSON.stringify(initialHand) !== JSON.stringify(initialValues.initialHand);
  const isTokensDirty = JSON.stringify(initialTokens) !== JSON.stringify(initialValues.initialTokens);
  const isComponentsDirty = JSON.stringify(localComponents) !== JSON.stringify(initialValues.components);

  // 選択ゲームが変わった時にフォーム値を更新
  useEffect(() => {
    if (selectedGame && !isSaving) {
      const configMaxPlayers = selectedGame.maxPlayers ?? 1;
      const configInitialHand = selectedGame.initialHand ?? {};
      const configInitialTokens = selectedGame.initialTokens ?? {};
      const configComponents = selectedGame.components ?? [];

      setInitialValues({
        maxPlayers: configMaxPlayers,
        initialHand: { ...configInitialHand },
        initialTokens: { ...configInitialTokens },
        components: [...configComponents],
      });

      // 編集中（Dirty）でない場合のみ、外部の最新データを localComponents に反映する
      if (!isComponentsDirty) {
        setMaxPlayers(configMaxPlayers);
        setInitialHand({ ...configInitialHand });
        setInitialTokens({ ...configInitialTokens });
        setLocalComponents([...configComponents]);
      }
    }
  }, [selectedGame, isSaving, isComponentsDirty]);

  useEffect(() => {
    const onUpdated = (data: { success: boolean }) => {
      if (data.success) {
        setIsSaving(false);
        setShowSuccess(true);

        // 保存成功時の「現在の値」を「初期値」として上書きし、Dirty判定をクリアする
        setInitialValues({
          maxPlayers: maxPlayers,
          initialHand: { ...initialHand },
          initialTokens: { ...initialTokens },
          components: [...localComponents],
        });

        setTimeout(() => setShowSuccess(false), 2000);
      }
    };

    const onCreated = (data: { success: boolean; gameId: string }) => {
      if (data.success) {
        setSelectedGameId(data.gameId);
        setNewGameName('');
        setNewGameIcon('🎲');
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
  }, [socket, maxPlayers, initialHand, initialTokens, localComponents, selectedGameId, gameMeta]);

  const handleSave = () => {
    if (!socket.connected || !selectedGameId) return;

    const newParam: Partial<GameMeta> = {};
    if (isMaxPlayersDirty) newParam.maxPlayers = maxPlayers;
    if (isHandDirty) newParam.initialHand = initialHand;
    if (isTokensDirty) newParam.initialTokens = initialTokens;
    if (isComponentsDirty) newParam.components = localComponents;

    if (Object.keys(newParam).length === 0) return;

    setIsSaving(true);
    socket.emit('game-param:update', {
      gameId: selectedGameId,
      newParam,
    } as GameParamUpdateData);
  };

  const handleCreateGame = () => {
    if (!newGameName || !socket.connected) return;

    // アルファベット以外を排除して小文字に変換
    // 例: "My Game 01!" -> "mygame"
    const sanitizedGameId = newGameName.toLowerCase().replace(/[^a-z]/g, '');

    if (!sanitizedGameId) {
      alert('ゲーム名はアルファベットを含めてください');
      return;
    }

    socket.emit('game:create', {
      gameName: sanitizedGameId,
      gameIcon: newGameIcon || '🎲',
    } as GameCreateData);
  };

  const handleDeleteGame = () => {
    if (!selectedGameId || !socket.connected) return;
    if (window.confirm(`ゲーム「${selectedGameId}」を削除しますか？`)) {
      socket.emit('game:delete', { gameId: selectedGameId } as GameDeleteData);
    }
  };

  // コンポーネント追加ハンドラ
  const handleAddComponent = () => {
    if (!newCompId || !selectedGameId) return;

    const newComponent: ComponentInfo = {
      id: newCompId,
      type: newCompType,
      props: {
        diceId: '天気',
        sides: 4,
        title: '天気ダイス',
        tooltipText: '快晴・曇り・風・雨',
        customFaces: ['/weather_sunny.png', '/weather_cloud.png', '/weather_wind.png', '/weather_rain.png'],
      },
    };

    // ローカル状態のみ更新（保存ボタンを押すまで emit しないことで増殖を防ぐ）
    setLocalComponents([...localComponents, newComponent]);

    // 既存のコンポーネント配列をコピーして新要素を追加
    const currentComponents = selectedGame?.components || [];
    const updatedComponents = [...currentComponents, newComponent];

    const updateData = {
      gameId: selectedGameId,
      newParam: {
        components: updatedComponents,
      },
    };

    socket.emit('game-param:update', {
      gameId: selectedGameId,
      newParam: updateData.newParam,
    } as GameParamUpdateData);

    setNewCompId('');
  };

  // コンポーネント削除ハンドラ
  const handleDeleteComponent = (compId: string) => {
    const updated = localComponents.filter((comp) => comp.id !== compId);
    setLocalComponents(updated);

    socket.emit('game-param:update', {
      gameId: selectedGameId,
      newParam: {
        components: updated,
      },
    } as GameParamUpdateData);
  };

  return (
    <>
      <button className={styles.hamburger} onClick={onToggle}>
        {isOpen ? '✕' : '☰'}
      </button>

      <div className={`${styles.wrapper} ${isOpen ? styles.open : ''}`}>
        <div
          className={styles.container}
          style={{
            maxHeight: '100vh',
            overflowY: 'auto',
            paddingBottom: '60px',
          }}
        >
          <h3 className={styles.title}>コントロールパネル</h3>

          {/* 新規作成セクション */}
          <div className={styles.field}>
            <div className={styles.label}>新規ゲーム作成:</div>
            <div style={{ display: 'flex', gap: '8px' }}>
              {/* アイコン入力 (幅を狭く) */}
              <input
                type="text"
                className={styles.select}
                style={{ width: '45px', textAlign: 'center' }}
                placeholder="Icon"
                value={newGameIcon}
                onChange={(e) => setNewGameIcon(e.target.value.slice(0, 5))}
              />
              {/* 名前入力 */}
              <input
                type="text"
                className={styles.select}
                style={{ flex: 1 }}
                placeholder="GameName"
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

          {/* コンポーネント追加（座標固定） */}
          {selectedGame && (
            <div
              className={styles.field}
              style={{ background: '#222', padding: '10px', borderRadius: '4px', marginTop: '10px' }}
            >
              <div className={styles.label}>コンポーネント追加:</div>
              <div style={{ display: 'flex', gap: '4px' }}>
                <select
                  className={styles.select}
                  style={{ width: '70px' }}
                  value={newCompType}
                  onChange={(e) => setNewCompType(e.target.value as any)}
                >
                  <option value="Dice">Dice</option>
                  <option value="Board">Board</option>
                </select>
                <input
                  type="text"
                  className={styles.select}
                  style={{ flex: 1 }}
                  placeholder="ID (例: dice-2)"
                  value={newCompId}
                  onChange={(e) => setNewCompId(e.target.value)}
                />
                <button
                  className={styles.saveButton}
                  onClick={handleAddComponent}
                  style={{ marginTop: 0, padding: '0 10px' }}
                  disabled={!newCompId}
                >
                  追加
                </button>
              </div>
            </div>
          )}

          {/* コンポーネントリスト表示 */}
          {localComponents.length > 0 && (
            <div style={{ marginTop: '10px' }}>
              <div className={styles.label}>既存コンポーネント: {isComponentsDirty && <small>(変更あり)</small>}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {localComponents.map((comp) => (
                  <div
                    key={comp.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      background: '#333',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                    }}
                  >
                    <span>
                      {comp.id} ({comp.type})
                    </span>
                    <button
                      onClick={() => handleDeleteComponent(comp.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#ff4444',
                        cursor: 'pointer',
                        padding: '0 4px',
                      }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <hr className={styles.divider} style={{ margin: '20px 0', border: 'none', borderTop: '1px solid #444' }} />

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

              {/* 手札・トークン設定 */}
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
            disabled={
              !socket.connected ||
              isSaving ||
              (!isMaxPlayersDirty && !isHandDirty && !isTokensDirty && !isComponentsDirty)
            }
          >
            {isSaving ? '保存中...' : showSuccess ? '完了' : '変更箇所のみ反映'}
          </button>
        </div>
      </div>
    </>
  );
};
