import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from 'react';
import styles from './ControlPanel.module.css';
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
    // 比較用の初期値保持
    const [initialValues, setInitialValues] = useState({
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
        const onUpdated = (data) => {
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
    }, [socket, maxPlayers, initialHand, initialTokens, selectedGameId, gameMeta]);
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
        if (Object.keys(newParam).length === 0)
            return;
        setIsSaving(true);
        socket.emit('game-param:save', {
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
        if (!newCompId || !socket.connected || !selectedGameId)
            return;
        const newComponent = {
            id: newCompId,
            type: newCompType,
            props: {
                x: 500, // 座標固定
                y: 500,
                title: `${newCompType}-${newCompId}`,
            },
        };
        socket.emit('game-param:add-component', {
            gameId: selectedGameId,
            component: newComponent,
        });
        setNewCompId('');
    };
    return (_jsxs(_Fragment, { children: [_jsx("button", { className: styles.hamburger, onClick: onToggle, children: isOpen ? '✕' : '☰' }), _jsx("div", { className: `${styles.wrapper} ${isOpen ? styles.open : ''}`, children: _jsxs("div", { className: styles.container, style: {
                        maxHeight: '100vh',
                        overflowY: 'auto',
                        paddingBottom: '60px', // ボタンが隠れないよう余白
                    }, children: [_jsx("h3", { className: styles.title, children: "\u30B3\u30F3\u30C8\u30ED\u30FC\u30EB\u30D1\u30CD\u30EB" }), _jsxs("div", { className: styles.field, children: [_jsx("div", { className: styles.label, children: "\u65B0\u898F\u30B2\u30FC\u30E0\u4F5C\u6210:" }), _jsxs("div", { style: { display: 'flex', gap: '8px' }, children: [_jsx("input", { type: "text", className: styles.select, style: { width: '45px', textAlign: 'center' }, placeholder: "Icon", value: newGameIcon, onChange: (e) => setNewGameIcon(e.target.value.slice(0, 5)) }), _jsx("input", { type: "text", className: styles.select, style: { flex: 1 }, placeholder: "GameName", value: newGameName, onChange: (e) => setNewGameName(e.target.value) }), _jsx("button", { className: styles.saveButton, onClick: handleCreateGame, style: { marginTop: 0, padding: '0 15px', whiteSpace: 'nowrap' }, disabled: !newGameName, children: "\u4F5C\u6210" })] })] }), _jsx("hr", { className: styles.divider, style: { margin: '20px 0', border: 'none', borderTop: '1px solid #444' } }), _jsxs("div", { className: styles.field, children: [_jsxs("div", { className: styles.label, style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' }, children: [_jsx("span", { children: "\u5BFE\u8C61\u30B2\u30FC\u30E0\u3092\u9078\u629E:" }), _jsx("button", { onClick: () => setIsDeleteMode(!isDeleteMode), style: {
                                                background: 'none',
                                                border: 'none',
                                                color: isDeleteMode ? '#ff4444' : '#888',
                                                cursor: 'pointer',
                                                fontSize: '12px',
                                            }, children: isDeleteMode ? 'キャンセル' : '削除モード' })] }), _jsxs("div", { style: { display: 'flex', gap: '8px' }, children: [_jsxs("select", { className: styles.select, style: { flex: 1 }, value: selectedGameId, onChange: (e) => setSelectedGameId(e.target.value), children: [gameMeta.length === 0 && _jsx("option", { value: "", children: "\u8AAD\u307F\u8FBC\u307F\u4E2D..." }), gameMeta.map((game) => (_jsx("option", { value: game.gameId, children: game.gameId }, game.gameId)))] }), isDeleteMode && selectedGameId && (_jsx("button", { className: styles.saveButton, onClick: handleDeleteGame, style: {
                                                marginTop: 0,
                                                padding: '0 15px',
                                                background: '#ff4444',
                                                border: 'none',
                                                whiteSpace: 'nowrap',
                                            }, children: "\u524A\u9664" }))] })] }), selectedGame && (_jsxs("div", { className: styles.field, style: { background: '#222', padding: '10px', borderRadius: '4px', marginTop: '10px' }, children: [_jsx("div", { className: styles.label, children: "\u30B3\u30F3\u30DD\u30FC\u30CD\u30F3\u30C8\u8FFD\u52A0:" }), _jsxs("div", { style: { display: 'flex', gap: '4px' }, children: [_jsxs("select", { className: styles.select, style: { width: '70px' }, value: newCompType, onChange: (e) => setNewCompType(e.target.value), children: [_jsx("option", { value: "Dice", children: "Dice" }), _jsx("option", { value: "Board", children: "Board" })] }), _jsx("input", { type: "text", className: styles.select, style: { flex: 1 }, placeholder: "ID (\u4F8B: dice-2)", value: newCompId, onChange: (e) => setNewCompId(e.target.value) }), _jsx("button", { className: styles.saveButton, onClick: handleAddComponent, style: { marginTop: 0, padding: '0 10px' }, disabled: !newCompId, children: "\u8FFD\u52A0" })] })] })), _jsx("hr", { className: styles.divider, style: { margin: '20px 0', border: 'none', borderTop: '1px solid #444' } }), selectedGame && (_jsxs(_Fragment, { children: [selectedGame.maxPlayers !== undefined && (_jsxs("div", { className: styles.field, children: [_jsxs("div", { className: styles.label, children: [_jsxs("span", { children: ["\u6700\u5927\u30D7\u30EC\u30A4\u30E4\u30FC\u6570: ", isMaxPlayersDirty && _jsx("small", { children: "(\u5909\u66F4\u3042\u308A)" })] }), _jsx("strong", { children: maxPlayers })] }), _jsx("input", { type: "range", min: "1", max: "10", className: styles.slider, value: maxPlayers, onChange: (e) => setMaxPlayers(Number(e.target.value)) })] })), Object.entries(initialHand).map(([deckId, count]) => (_jsxs("div", { className: styles.field, children: [_jsxs("div", { className: styles.label, children: [_jsx("span", { children: _jsxs("strong", { children: ["Hand: ", deckId] }) }), initialValues.initialHand[deckId] !== count && _jsx("small", { children: " (\u5909\u66F4\u3042\u308A)" })] }), _jsxs("div", { className: styles.label, children: [_jsx("span", { children: "\u679A\u6570:" }), _jsx("strong", { children: count })] }), _jsx("input", { type: "range", min: "0", max: "10", className: styles.slider, value: count, onChange: (e) => {
                                                setInitialHand({
                                                    ...initialHand,
                                                    [deckId]: Number(e.target.value),
                                                });
                                            } })] }, `hand-${deckId}`))), Object.entries(initialTokens).map(([tokenId, count]) => (_jsxs("div", { className: styles.field, children: [_jsxs("div", { className: styles.label, children: [_jsx("span", { children: _jsxs("strong", { children: ["Token: ", tokenId] }) }), initialValues.initialTokens[tokenId] !== count && _jsx("small", { children: " (\u5909\u66F4\u3042\u308A)" })] }), _jsxs("div", { className: styles.label, children: [_jsx("span", { children: "\u500B\u6570:" }), _jsx("strong", { children: count })] }), _jsx("input", { type: "range", min: "0", max: "10", className: styles.slider, value: count, onChange: (e) => {
                                                setInitialTokens({
                                                    ...initialTokens,
                                                    [tokenId]: Number(e.target.value),
                                                });
                                            } })] }, `token-${tokenId}`)))] })), _jsx("button", { className: styles.saveButton, onClick: handleSave, disabled: !socket.connected || isSaving || (!isMaxPlayersDirty && !isHandDirty && !isTokensDirty), children: isSaving ? '保存中...' : showSuccess ? '完了' : '変更箇所のみ反映' })] }) })] }));
};
