// src/gui/ControlPanel.tsx
import { ComponentId, DeckId, DraggableData, DraggableId, TokenStoreId } from '@/index.js';
import { ComponentInfo, GameParam } from '@/types/server.js';
import { GameParamUpdateData } from '@/types/socketData.js';
import { useEffect, useMemo, useState } from 'react';
import type { Socket } from 'socket.io-client';
import { ComponentFactory } from './ComponentFactory.js';
import styles from './ControlPanel.module.css';
import { GameFactory } from './GameFactory.js';

/**
 * ゲームの設定管理およびリアルタイム更新を行う。
 * 新規ゲームの作成、既存ゲームのパラメータ（プレイヤー数、初期手札、トークン）、
 * およびゲーム内コンポーネント（ダイスやボード等）の動的な追加・削除を管理する。
 * @param {Socket} props.socket - サーバー通信用の Socket.io クライアントインスタンス
 * @param {GameParam[]} props.GameParam - サーバーから取得した全ゲーム情報の配列
 * @param {containerRef}
 * @param {boolean} props.isOpen - パネルの開閉状態
 * @param {function} props.onToggle - パネルの開閉状態を切り替えるコールバック関数
 */
export const ControlPanel = ({
  socket,
  GameParam,
  containerRef,
  isOpen,
  onToggle,
}: {
  socket: Socket;
  GameParam: GameParam[];
  containerRef: React.RefObject<HTMLElement | null>;
  isOpen: boolean;
  onToggle: () => void;
}) => {
  const [selectedGameId, setSelectedGameId] = useState<string>('');

  // 各種パラメータの状態
  const [maxPlayers, setMaxPlayers] = useState(1);
  const [initialHand, setInitialHand] = useState<Record<string, number>>({});
  const [initialTokens, setInitialTokens] = useState<Record<string, number>>({});

  // 現在の座標状態を管理
  const [draggables, setDraggables] = useState<Record<DraggableId, DraggableData>>({});
  const [localComponents, setLocalComponents] = useState<ComponentInfo[]>([]);

  // 比較用の初期値保持
  const [initialValues, setInitialValues] = useState({
    maxPlayers: 1,
    initialHand: {} as Record<string, number>,
    initialTokens: {} as Record<string, number>,
    draggables: {} as Record<DraggableId, DraggableData>,
    components: [] as ComponentInfo[],
  });

  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // ゲーム選択の初期化
  useEffect(() => {
    if (GameParam.length > 0 && !selectedGameId) {
      setSelectedGameId(GameParam[0].gameId);
    }
  }, [GameParam, selectedGameId]);

  /** 現在選択されているゲームのオブジェクトをメモ化 */
  const selectedGame = useMemo(() => GameParam.find((g) => g.gameId === selectedGameId), [selectedGameId, GameParam]);

  /** 変更検知フラグ（Dirtyチェック） */
  const isMaxPlayersDirty = maxPlayers !== initialValues.maxPlayers;
  const isHandDirty = JSON.stringify(initialHand) !== JSON.stringify(initialValues.initialHand);
  const isTokensDirty = JSON.stringify(initialTokens) !== JSON.stringify(initialValues.initialTokens);
  const isComponentsDirty = JSON.stringify(localComponents) !== JSON.stringify(initialValues.components);
  const isDraggablesDirty = JSON.stringify(draggables) !== JSON.stringify(initialValues.draggables);

  /** 選択ゲームが切り替わった際のフォーム値の同期 */
  useEffect(() => {
    if (selectedGame && !isSaving) {
      const configMaxPlayers = selectedGame.maxPlayers ?? 1;
      const configInitialHand = selectedGame.initialHand ?? {};
      const configInitialTokens = selectedGame.initialTokens ?? {};
      const configComponents = selectedGame.components ?? [];
      const configDraggables = selectedGame.draggables ?? {};

      setInitialValues({
        maxPlayers: configMaxPlayers,
        initialHand: { ...configInitialHand },
        initialTokens: { ...configInitialTokens },
        draggables: { ...configDraggables },
        components: [...configComponents],
      });

      // 他の項目も含め、未編集の場合のみ外部データを反映
      if (!isComponentsDirty && !isMaxPlayersDirty && !isHandDirty && !isTokensDirty && !isDraggablesDirty) {
        setMaxPlayers(configMaxPlayers);
        setInitialHand({ ...configInitialHand });
        setInitialTokens({ ...configInitialTokens });
        setLocalComponents([...configComponents]);
        setDraggables({ ...configDraggables });
      }
    }
  }, [selectedGame, isSaving, isComponentsDirty, isMaxPlayersDirty, isHandDirty, isTokensDirty, isDraggablesDirty]);

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
          draggables: { ...draggables },
          components: [...localComponents],
        });

        setTimeout(() => setShowSuccess(false), 2000);
      }
    };

    socket.on('game-param:updated', onUpdated);
    return () => {
      socket.off('game-param:updated', onUpdated);
    };
  }, [socket, maxPlayers, initialHand, initialTokens, localComponents, draggables]);

  /** 変更箇所を抽出し、サーバーへ一括送信する */
  const handleSave = () => {
    if (!socket.connected || !selectedGameId) return;

    const newParam: Partial<GameParam> = {};
    if (isMaxPlayersDirty) newParam.maxPlayers = maxPlayers;
    if (isHandDirty) newParam.initialHand = initialHand;
    if (isTokensDirty) newParam.initialTokens = initialTokens;
    if (isComponentsDirty) newParam.components = localComponents;
    if (isDraggablesDirty) newParam.draggables = draggables;

    setIsSaving(true);
    socket.emit('game-param:update', {
      gameId: selectedGameId,
      newParam,
    } as GameParamUpdateData);
  };

  const handleAddComponent = (newComponent: ComponentInfo, additionalParams?: any) => {
    if (!selectedGameId) return;
    const updatedComponents = [...localComponents, newComponent];
    const updatedDraggables = {
      ...draggables,
      ...(additionalParams?.draggables || {}),
    };

    setLocalComponents(updatedComponents);
    setDraggables(updatedDraggables);

    socket.emit('game-param:update', {
      gameId: selectedGameId,
      newParam: {
        ...additionalParams,
        draggables: updatedDraggables,
        components: updatedComponents,
      },
    } as GameParamUpdateData);
  };

  // コンポーネント削除ハンドラ
  const handleDeleteComponent = (compId: ComponentId, additionalParams?: any) => {
    const updatedComponents = localComponents.filter((comp) => comp.id !== compId);

    // 削除時は Factory から渡された「削除済みリスト」でステートも上書き
    const updatedDraggables = additionalParams?.draggables ?? draggables;

    setLocalComponents(updatedComponents);
    setDraggables(updatedDraggables);

    socket.emit('game-param:update', {
      gameId: selectedGameId,
      newParam: {
        ...additionalParams,
        draggables: updatedDraggables,
        components: updatedComponents,
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

          {/* ゲームの箱（作成・選択・削除）を管理 */}
          <GameFactory
            socket={socket}
            GameParam={GameParam}
            selectedGameId={selectedGameId}
            onSelect={setSelectedGameId}
          />
          {/* Factoryにリスト管理と削除機能を集約 */}
          <hr className={styles.divider} />

          {/* Factoryにリスト管理と削除機能を集約 */}
          <ComponentFactory
            onAdd={handleAddComponent}
            onDelete={handleDeleteComponent}
            existingComponents={localComponents}
            fullGameParam={selectedGame}
            containerRef={containerRef}
          />

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
