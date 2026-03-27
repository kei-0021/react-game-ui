import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from 'react';
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
export const ControlPanel = ({ socket, gameMeta, isOpen, onToggle, }) => {
    const [selectedGameId, setSelectedGameId] = useState('');
    const [newGameName, setNewGameName] = useState('');
    const [newGameIcon, setNewGameIcon] = useState('🎲');
    // 新規コンポーネント追加用の状態
    const [newCompId, setNewCompId] = useState('');
    const [newCompType, setNewCompType] = useState('Dice');
    // 各種パラメータの状態
    const [maxPlayers, setMaxPlayers] = useState(1);
    const [initialHand, setInitialHand] = useState({});
    const [initialTokens, setInitialTokens] = useState({});
    // コンポーネントのローカル状態
    const [localComponents, setLocalComponents] = useState([]);
    // 比較用の初期値保持
    const [initialValues, setInitialValues] = useState({
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
        const onUpdated = (data) => {
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
        const onCreated = (data) => {
            if (data.success) {
                setSelectedGameId(data.gameId);
                setNewGameName('');
                setNewGameIcon('🎲');
            }
        };
        const onDeleted = (data) => {
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
        if (Object.keys(newParam).length === 0)
            return;
        setIsSaving(true);
        socket.emit('game-param:update', {
            gameId: selectedGameId,
            newParam,
        });
    };
    const handleCreateGame = () => {
        if (!newGameName || !socket.connected)
            return;
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
        });
    };
    const handleDeleteGame = () => {
        if (!selectedGameId || !socket.connected)
            return;
        if (window.confirm(`ゲーム「${selectedGameId}」を削除しますか？`)) {
            socket.emit('game:delete', { gameId: selectedGameId });
        }
    };
    // コンポーネント追加ハンドラ
    const handleAddComponent = () => {
        if (!newCompId || !selectedGameId)
            return;
        const newComponent = {
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
        });
        setNewCompId('');
    };
    // コンポーネント削除ハンドラ
    const handleDeleteComponent = (compId) => {
        const updated = localComponents.filter((comp) => comp.id !== compId);
        setLocalComponents(updated);
        socket.emit('game-param:update', {
            gameId: selectedGameId,
            newParam: {
                components: updated,
            },
        });
    };
    return (_jsxs(_Fragment, { children: [_jsx("button", { className: styles.hamburger, onClick: onToggle, children: isOpen ? '✕' : '☰' }), _jsx("div", { className: `${styles.wrapper} ${isOpen ? styles.open : ''}`, children: _jsxs("div", { className: styles.scrollContainer, children: [_jsx("h3", { className: styles.title, children: "\u30B3\u30F3\u30C8\u30ED\u30FC\u30EB\u30D1\u30CD\u30EB" }), _jsxs("div", { className: styles.field, children: [_jsx("div", { className: styles.label, children: "\u65B0\u898F\u30B2\u30FC\u30E0\u4F5C\u6210:" }), _jsxs("div", { className: styles.createSection, children: [_jsx("input", { type: "text", className: `${styles.select} ${styles.iconInput}`, placeholder: "Icon", value: newGameIcon, onChange: (e) => setNewGameIcon(e.target.value.slice(0, 5)) }), _jsx("input", { type: "text", className: `${styles.select} ${styles.flexFill}`, placeholder: "GameName", value: newGameName, onChange: (e) => setNewGameName(e.target.value) }), _jsx("button", { className: `${styles.saveButton} ${styles.createButton}`, onClick: handleCreateGame, disabled: !newGameName, children: "\u4F5C\u6210" })] })] }), _jsx("hr", { className: styles.divider }), _jsxs("div", { className: styles.field, children: [_jsxs("div", { className: styles.rangeHeader, children: [_jsx("div", { className: styles.label, children: "\u5BFE\u8C61\u30B2\u30FC\u30E0\u3092\u9078\u629E:" }), _jsx("button", { onClick: () => setIsDeleteMode(!isDeleteMode), className: styles.deleteModeBtn, style: { color: isDeleteMode ? '#ff4444' : '#888' }, children: isDeleteMode ? 'キャンセル' : '削除モード' })] }), _jsxs("div", { className: styles.createSection, children: [_jsxs("select", { className: `${styles.select} ${styles.flexFill}`, value: selectedGameId, onChange: (e) => setSelectedGameId(e.target.value), children: [gameMeta.length === 0 && _jsx("option", { value: "", children: "\u8AAD\u307F\u8FBC\u307F\u4E2D..." }), gameMeta.map((game) => (_jsx("option", { value: game.gameId, children: game.gameId }, game.gameId)))] }), isDeleteMode && selectedGameId && (_jsx("button", { className: styles.saveButton, onClick: handleDeleteGame, style: { background: '#ff4444', border: 'none' }, children: "\u524A\u9664" }))] })] }), selectedGame && (_jsxs("div", { className: styles.addComponentBox, children: [_jsx("div", { className: styles.label, children: "\u30B3\u30F3\u30DD\u30FC\u30CD\u30F3\u30C8\u8FFD\u52A0:" }), _jsxs("div", { className: styles.createSection, children: [_jsxs("select", { className: `${styles.select} ${styles.compTypeSelect}`, value: newCompType, onChange: (e) => setNewCompType(e.target.value), children: [_jsx("option", { value: "Dice", children: "Dice" }), _jsx("option", { value: "Board", children: "Board" })] }), _jsx("input", { type: "text", className: `${styles.select} ${styles.flexFill}`, placeholder: "ID (\u4F8B: dice-2)", value: newCompId, onChange: (e) => setNewCompId(e.target.value) }), _jsx("button", { className: styles.saveButton, onClick: handleAddComponent, disabled: !newCompId, children: "\u8FFD\u52A0" })] })] })), localComponents.length > 0 && (_jsxs("div", { style: { marginTop: '10px' }, children: [_jsxs("div", { className: styles.label, children: ["\u65E2\u5B58\u30B3\u30F3\u30DD\u30FC\u30CD\u30F3\u30C8: ", isComponentsDirty && _jsx("span", { className: styles.dirtyLabel, children: "(\u5909\u66F4\u3042\u308A)" })] }), _jsx("div", { className: styles.componentList, children: localComponents.map((comp) => (_jsxs("div", { className: styles.componentItem, children: [_jsxs("span", { children: [comp.id, " (", comp.type, ")"] }), _jsx("button", { onClick: () => handleDeleteComponent(comp.id), className: styles.deleteCompBtn, children: "\u2715" })] }, comp.id))) })] })), _jsx("hr", { className: styles.divider }), selectedGame && (_jsxs(_Fragment, { children: [selectedGame.maxPlayers !== undefined && (_jsxs("div", { className: styles.field, children: [_jsxs("div", { className: styles.rangeHeader, children: [_jsxs("div", { className: styles.label, children: ["\u6700\u5927\u30D7\u30EC\u30A4\u30E4\u30FC\u6570: ", isMaxPlayersDirty && _jsx("span", { className: styles.dirtyLabel, children: "(\u5909\u66F4\u3042\u308A)" })] }), _jsx("span", { className: styles.rangeValue, children: maxPlayers })] }), _jsx("input", { type: "range", min: "1", max: "10", className: styles.slider, value: maxPlayers, onChange: (e) => setMaxPlayers(Number(e.target.value)) })] })), Object.entries(initialHand).map(([deckId, count]) => (_jsxs("div", { className: styles.rangeField, children: [_jsxs("div", { className: styles.rangeHeader, children: [_jsxs("div", { className: styles.label, children: [_jsxs("strong", { children: ["Hand: ", deckId] }), initialValues.initialHand[deckId] !== count && (_jsx("span", { className: styles.dirtyLabel, children: "(\u5909\u66F4\u3042\u308A)" }))] }), _jsx("span", { className: styles.rangeValue, children: count })] }), _jsx("input", { type: "range", min: "0", max: "10", className: styles.slider, value: count, onChange: (e) => {
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
