import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from 'react';
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
export const ControlPanel = ({ socket, GameParam, containerRef, isOpen, onToggle, }) => {
    const [selectedGameId, setSelectedGameId] = useState('');
    // 各種パラメータの状態
    const [maxPlayers, setMaxPlayers] = useState(1);
    const [initialHand, setInitialHand] = useState({});
    const [initialTokens, setInitialTokens] = useState({});
    // 現在の座標状態を管理
    const [draggables, setDraggables] = useState({});
    const [localComponents, setLocalComponents] = useState([]);
    // 比較用の初期値保持
    const [initialValues, setInitialValues] = useState({
        maxPlayers: 1,
        initialHand: {},
        initialTokens: {},
        draggables: {},
        components: [],
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
        const onUpdated = (data) => {
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
        if (!socket.connected || !selectedGameId)
            return;
        const newParam = {};
        if (isMaxPlayersDirty)
            newParam.maxPlayers = maxPlayers;
        if (isHandDirty)
            newParam.initialHand = initialHand;
        if (isTokensDirty)
            newParam.initialTokens = initialTokens;
        if (isComponentsDirty)
            newParam.components = localComponents;
        if (isDraggablesDirty)
            newParam.draggables = draggables;
        setIsSaving(true);
        socket.emit('game-param:update', {
            gameId: selectedGameId,
            newParam,
        });
    };
    const handleAddComponent = (newComponent, additionalParams) => {
        if (!selectedGameId)
            return;
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
        });
    };
    // コンポーネント削除ハンドラ
    const handleDeleteComponent = (compId, additionalParams) => {
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
        });
    };
    return (_jsxs(_Fragment, { children: [_jsx("button", { className: styles.hamburger, onClick: onToggle, children: isOpen ? '✕' : '☰' }), _jsx("div", { className: `${styles.wrapper} ${isOpen ? styles.open : ''}`, children: _jsxs("div", { className: styles.scrollContainer, children: [_jsx("h3", { className: styles.title, children: "\u30B3\u30F3\u30C8\u30ED\u30FC\u30EB\u30D1\u30CD\u30EB" }), _jsx(GameFactory, { socket: socket, GameParam: GameParam, selectedGameId: selectedGameId, onSelect: setSelectedGameId }), _jsx("hr", { className: styles.divider }), _jsx(ComponentFactory, { onAdd: handleAddComponent, onDelete: handleDeleteComponent, existingComponents: localComponents, fullGameParam: selectedGame, containerRef: containerRef }), _jsx("hr", { className: styles.divider }), selectedGame && (_jsxs(_Fragment, { children: [selectedGame.maxPlayers !== undefined && (_jsxs("div", { className: styles.field, children: [_jsxs("div", { className: styles.rangeHeader, children: [_jsxs("div", { className: styles.label, children: ["\u6700\u5927\u30D7\u30EC\u30A4\u30E4\u30FC\u6570: ", isMaxPlayersDirty && _jsx("span", { className: styles.dirtyLabel, children: "(\u5909\u66F4\u3042\u308A)" })] }), _jsx("span", { className: styles.rangeValue, children: maxPlayers })] }), _jsx("input", { type: "range", min: "1", max: "10", className: styles.slider, value: maxPlayers, onChange: (e) => setMaxPlayers(Number(e.target.value)) })] })), Object.entries(initialHand).map(([deckId, count]) => (_jsxs("div", { className: styles.rangeField, children: [_jsxs("div", { className: styles.rangeHeader, children: [_jsxs("div", { className: styles.label, children: [_jsxs("strong", { children: ["Hand: ", deckId] }), initialValues.initialHand[deckId] !== count && (_jsx("span", { className: styles.dirtyLabel, children: "(\u5909\u66F4\u3042\u308A)" }))] }), _jsx("span", { className: styles.rangeValue, children: count })] }), _jsx("input", { type: "range", min: "0", max: "10", className: styles.slider, value: count, onChange: (e) => {
                                                setInitialHand({
                                                    ...initialHand,
                                                    [deckId]: Number(e.target.value),
                                                });
                                            } })] }, `hand-${deckId}`))), Object.entries(initialTokens).map(([tokenId, count]) => (_jsxs("div", { className: styles.rangeField, children: [_jsxs("div", { className: styles.rangeHeader, children: [_jsxs("div", { className: styles.label, children: [_jsxs("strong", { children: ["Token: ", tokenId] }), initialValues.initialTokens[tokenId] !== count && (_jsx("span", { className: styles.dirtyLabel, children: "(\u5909\u66F4\u3042\u308A)" }))] }), _jsx("span", { className: styles.rangeValue, children: count })] }), _jsx("input", { type: "range", min: "0", max: "10", className: styles.slider, value: count, onChange: (e) => {
                                                setInitialTokens({
                                                    ...initialTokens,
                                                    [tokenId]: Number(e.target.value),
                                                });
                                            } })] }, `token-${tokenId}`)))] })), _jsx("button", { className: styles.saveButton, onClick: handleSave, disabled: !socket.connected ||
                                isSaving ||
                                (!isMaxPlayersDirty && !isHandDirty && !isTokensDirty && !isComponentsDirty), children: isSaving ? '保存中...' : showSuccess ? '完了' : '変更箇所のみ反映' })] }) })] }));
};
