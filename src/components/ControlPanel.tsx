// src/components/ControlPanel.tsx
import { DeckId, TokenStoreId } from '@/types/definition.js';
import { COMPONENT_TYPES, ComponentInfo, ComponentType } from '@/types/server.js';
import { GameCreateData, GameDeleteData, GameMeta, GameParamUpdateData } from '@/types/socketData.js';
import { useEffect, useMemo, useState } from 'react';
import type { Socket } from 'socket.io-client';
import styles from './ControlPanel.module.css';

/**
 * ゲームの設定管理およびリアルタイム更新を行う。
 * 新規ゲームの作成、既存ゲームのパラメータ（プレイヤー数、初期手札、トークン）、
 * およびゲーム内コンポーネント（ダイスやボード等）の動的な追加・削除を管理する。
 * @param {Object} props - コンポーネントのプロパティ
 * @param {Socket} props.socket - サーバー通信用の Socket.io クライアントインスタンス
 * @param {GameMeta[]} props.gameMeta - サーバーから取得した全ゲームのメタデータ配列
 * @param {boolean} props.isOpen - パネルの開閉状態
 * @param {function} props.onToggle - パネルの開閉状態を切り替えるコールバック関数
 */
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
  const [newCompId, setNewCompId] = useState<string>('');
  const [newCompType, setNewCompType] = useState<ComponentType>('Dice');

  // 各種パラメータの状態
  const [maxPlayers, setMaxPlayers] = useState(1);
  const [initialHand, setInitialHand] = useState<Record<string, number>>({});
  const [initialTokens, setInitialTokens] = useState<Record<string, number>>({});

  // コンポーネントのローカル状態
  const [localComponents, setLocalComponents] = useState<ComponentInfo[]>([]);

  // 比較用の初期値保持
  const [initialValues, setInitialValues] = useState<{
    maxPlayers: number;
    initialHand: Record<DeckId, number>;
    initialTokens: Record<TokenStoreId, number>;
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

  /** 現在選択されているゲームのオブジェクトをメモ化 */
  const selectedGame = useMemo(() => gameMeta.find((g) => g.gameId === selectedGameId), [selectedGameId, gameMeta]);

  /** 変更検知フラグ（Dirtyチェック） */
  const isMaxPlayersDirty = maxPlayers !== initialValues.maxPlayers;
  const isHandDirty = JSON.stringify(initialHand) !== JSON.stringify(initialValues.initialHand);
  const isTokensDirty = JSON.stringify(initialTokens) !== JSON.stringify(initialValues.initialTokens);
  const isComponentsDirty = JSON.stringify(localComponents) !== JSON.stringify(initialValues.components);

  /** 入力中のIDが既存のコンポーネントと重複していないかチェック */
  const isDuplicateId = localComponents.some((comp) => comp.id === newCompId);

  /** 選択ゲームが切り替わった際のフォーム値の同期 */
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

      // 他の項目も含め、未編集の場合のみ外部データを反映
      if (!isComponentsDirty && !isMaxPlayersDirty && !isHandDirty && !isTokensDirty) {
        setMaxPlayers(configMaxPlayers);
        setInitialHand({ ...configInitialHand });
        setInitialTokens({ ...configInitialTokens });
        setLocalComponents([...configComponents]);
      }
    }
  }, [selectedGame, isSaving, isComponentsDirty, isMaxPlayersDirty, isHandDirty, isTokensDirty]);

  /** Socket通信のイベントリスナー設定 */
  useEffect(() => {
    const onUpdated = (data: { success: boolean }) => {
      if (data.success) {
        setIsSaving(false);
        setShowSuccess(true);

        // 成功した現在の値を初期値として再設定
        setInitialValues({
          maxPlayers,
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

  /** 変更箇所を抽出し、サーバーへ一括送信する */
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

  /** 新規ゲームの作成依頼を送信 */
  const handleCreateGame = () => {
    if (!newGameName || !socket.connected) return;

    // アルファベット小文字のみを許容するID生成
    const sanitizedGameId = newGameName.toLowerCase().replace(/[^a-z]/g, '');
    if (!sanitizedGameId) return;

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

    let initialProps: Record<string, any> = {};

    // タイプに応じた初期設定
    switch (newCompType) {
      case 'Deck':
        initialProps = {
          deckId: `deck-${newCompId}`,
        };
        break;
      case 'Draggable':
        initialProps = {
          draggableId: `piece-${newCompId}`,
          image: '/hanabishi.svg',
          mask: true,
          color: 'red',
          size: 100,
          isDebug: true,
        };
        break;
      case 'Dice':
        initialProps = {
          diceId: `天気-${newCompId}`,
          sides: 4,
          title: '天気ダイス',
          tooltipText: '快晴・曇り・風・雨',
          customFaces: ['/weather_sunny.png', '/weather_cloud.png', '/weather_wind.png', '/weather_rain.png'],
        };
        break;
      case 'Timer':
        initialProps = { initialDuration: 30 };
        break;
      default:
        initialProps = {};
    }

    const newComponent: ComponentInfo = {
      id: newCompId,
      type: newCompType,
      props: initialProps,
    };

    const updatedLocal = [...localComponents, newComponent];
    setLocalComponents(updatedLocal);

    // 既存のコンポーネント配列をコピーして新要素を追加
    const currentComponents = selectedGame?.components || [];
    const updatedComponents = [...currentComponents, newComponent];

    // draggablesが存在すれば含め、なければ含めない動的なオブジェクト作成
    const newParam: Partial<GameMeta> = {
      components: updatedComponents,
    };

    switch (newCompType) {
      case 'Deck':
        newParam.initialDecks = [
          {
            deckId: `deck-${newCompId}`,
            name: 'カード',
            backColor: 'black',
            cards: [
              {
                id: '1',
                deckId: `deck-${newCompId}`,
                name: '1',
                ownerId: null,
                location: 'deck',
                drawCondition: ['field', 'face'],
                playLocation: 'discard',
                isFaceUp: true,
                backColor: 'black',
              },
            ],
          },
        ];
      case 'Draggable':
        newParam.draggables = {
          piece: {
            id: `piece-${newCompId}`,
            coordinate: {
              x: 500,
              y: 500,
            },
            zIndex: 100,
            rotation: 0,
          },
        };
    }

    socket.emit('game-param:update', {
      gameId: selectedGameId,
      newParam,
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
        <div className={styles.scrollContainer}>
          <h3 className={styles.title}>コントロールパネル</h3>

          {/* 新規作成セクション */}
          <div className={styles.field}>
            <div className={styles.label}>新規ゲーム作成:</div>
            <div className={styles.createSection}>
              {/* アイコン入力 */}
              <input
                type="text"
                className={`${styles.select} ${styles.iconInput}`}
                placeholder="Icon"
                value={newGameIcon}
                onChange={(e) => setNewGameIcon(e.target.value.slice(0, 5))}
              />
              {/* 名前入力 */}
              <input
                type="text"
                className={`${styles.select} ${styles.flexFill}`}
                placeholder="GameName"
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
                style={{ color: isDeleteMode ? '#ff4444' : '#888' }}
              >
                {isDeleteMode ? 'キャンセル' : '削除モード'}
              </button>
            </div>
            <div className={styles.createSection}>
              <select
                className={`${styles.select} ${styles.flexFill}`}
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
                  style={{ background: '#ff4444', border: 'none' }}
                >
                  削除
                </button>
              )}
            </div>
          </div>

          {/* コンポーネント追加（座標固定） */}
          {selectedGame && (
            <div className={styles.addComponentBox}>
              <div className={styles.label}>コンポーネント追加:</div>
              <div className={styles.createSection}>
                <select
                  className={`${styles.select} ${styles.compTypeSelect}`}
                  value={newCompType}
                  onChange={(e) => setNewCompType(e.target.value as ComponentType)}
                >
                  {COMPONENT_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  className={`${styles.select} ${styles.flexFill}`}
                  style={{ borderColor: isDuplicateId ? '#ff4444' : '' }}
                  placeholder="ID (例: dice-2)"
                  value={newCompId}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewCompId(e.target.value)}
                />
                <button
                  className={styles.saveButton}
                  onClick={handleAddComponent}
                  disabled={!newCompId || isDuplicateId}
                >
                  追加
                </button>
              </div>
              {isDuplicateId && (
                <div style={{ color: '#ff4444', fontSize: '12px', marginTop: '-4px' }}>
                  このIDは既に使用されています
                </div>
              )}
            </div>
          )}

          {/* コンポーネントリスト表示 */}
          {localComponents.length > 0 && (
            <div style={{ marginTop: '10px' }}>
              <div className={styles.label}>
                既存コンポーネント: {isComponentsDirty && <span className={styles.dirtyLabel}>(変更あり)</span>}
              </div>
              <div className={styles.componentList}>
                {localComponents.map((comp) => (
                  <div key={comp.id} className={styles.componentItem}>
                    <span>
                      {comp.id} ({comp.type})
                    </span>
                    {/* コンポーネント削除ハンドラ */}
                    <button onClick={() => handleDeleteComponent(comp.id)} className={styles.deleteCompBtn}>
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <hr className={styles.divider} />

          {/* 各種ゲームパラメータ調整エリア */}
          {selectedGame && (
            <>
              {/* 最大プレイヤー数設定 */}
              {selectedGame.maxPlayers !== undefined && (
                <div className={styles.field}>
                  <div className={styles.rangeHeader}>
                    <div className={styles.label}>
                      最大プレイヤー数: {isMaxPlayersDirty && <span className={styles.dirtyLabel}>(変更あり)</span>}
                    </div>
                    <span className={styles.rangeValue}>{maxPlayers}</span>
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

              {/* 手札設定 */}
              {Object.entries(initialHand).map(([deckId, count]) => (
                <div key={`hand-${deckId}`} className={styles.rangeField}>
                  <div className={styles.rangeHeader}>
                    <div className={styles.label}>
                      <strong>Hand: {deckId}</strong>
                      {initialValues.initialHand[deckId as DeckId] !== count && (
                        <span className={styles.dirtyLabel}>(変更あり)</span>
                      )}
                    </div>
                    <span className={styles.rangeValue}>{count}</span>
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

              {/* トークン設定 */}
              {Object.entries(initialTokens).map(([tokenId, count]) => (
                <div key={`token-${tokenId}`} className={styles.rangeField}>
                  <div className={styles.rangeHeader}>
                    <div className={styles.label}>
                      <strong>Token: {tokenId}</strong>
                      {initialValues.initialTokens[tokenId as TokenStoreId] !== count && (
                        <span className={styles.dirtyLabel}>(変更あり)</span>
                      )}
                    </div>
                    <span className={styles.rangeValue}>{count}</span>
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

          {/* 保存・反映ボタン */}
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
