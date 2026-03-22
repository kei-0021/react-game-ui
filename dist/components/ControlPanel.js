import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from 'react';
import styles from './ControlPanel.module.css';
export const ControlPanel = ({ socket, gameMeta, isOpen, onToggle, }) => {
    const [selectedGameId, setSelectedGameId] = useState('');
    const [maxPlayers, setMaxPlayers] = useState(1);
    const [initialHand, setInitialHand] = useState({});
    const [initialValues, setInitialValues] = useState({
        maxPlayers: 1,
        initialHand: {},
    });
    const [isSaving, setIsSaving] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    // gameMetaが空からデータありに変わった瞬間に最初の要素を強制セット
    useEffect(() => {
        if (gameMeta.length > 0 && !selectedGameId) {
            setSelectedGameId(gameMeta[0].gameId);
        }
    }, [gameMeta, selectedGameId]);
    const selectedGame = useMemo(() => gameMeta.find((g) => g.gameId === selectedGameId), [selectedGameId, gameMeta]);
    // 選択ゲームが確定・変更されたタイミングでStateを同期
    useEffect(() => {
        if (selectedGame) {
            const configMaxPlayers = selectedGame.maxPlayers ?? 1;
            const configInitialHand = selectedGame.initialHand ?? {};
            setInitialValues({
                maxPlayers: configMaxPlayers,
                initialHand: { ...configInitialHand },
            });
            setMaxPlayers(configMaxPlayers);
            setInitialHand({ ...configInitialHand });
        }
    }, [selectedGame]);
    const isMaxPlayersDirty = maxPlayers !== initialValues.maxPlayers;
    const isHandDirty = JSON.stringify(initialHand) !== JSON.stringify(initialValues.initialHand);
    useEffect(() => {
        const onUpdated = (data) => {
            if (data.success) {
                setIsSaving(false);
                setShowSuccess(true);
                setInitialValues({ maxPlayers, initialHand: { ...initialHand } });
                setTimeout(() => setShowSuccess(false), 2000);
            }
        };
        socket.on('game-param:updated', onUpdated);
        return () => {
            socket.off('game-param:updated', onUpdated);
        };
    }, [socket, maxPlayers, initialHand]);
    const handleSave = () => {
        if (!socket.connected || !selectedGameId)
            return;
        const newParam = {};
        if (isMaxPlayersDirty)
            newParam.maxPlayers = maxPlayers;
        if (isHandDirty)
            newParam.initialHand = initialHand;
        if (Object.keys(newParam).length === 0)
            return;
        setIsSaving(true);
        socket.emit('game-param:save', {
            gameId: selectedGameId,
            newParam,
        });
    };
    return (_jsxs(_Fragment, { children: [_jsx("button", { className: styles.hamburger, onClick: onToggle, children: isOpen ? '✕' : '☰' }), _jsx("div", { className: `${styles.wrapper} ${isOpen ? styles.open : ''}`, children: _jsxs("div", { className: styles.container, children: [_jsx("h3", { className: styles.title, children: "\u30B3\u30F3\u30C8\u30ED\u30FC\u30EB\u30D1\u30CD\u30EB" }), _jsxs("div", { className: styles.field, children: [_jsx("div", { className: styles.label, children: "\u5BFE\u8C61\u30B2\u30FC\u30E0\u3092\u9078\u629E:" }), _jsxs("select", { className: styles.select, value: selectedGameId, onChange: (e) => setSelectedGameId(e.target.value), children: [gameMeta.length === 0 && _jsx("option", { value: "", children: "\u8AAD\u307F\u8FBC\u307F\u4E2D..." }), gameMeta.map((game) => (_jsx("option", { value: game.gameId, children: game.gameId }, game.gameId)))] })] }), selectedGame && (_jsxs(_Fragment, { children: [selectedGame.maxPlayers !== undefined && (_jsxs("div", { className: styles.field, children: [_jsxs("div", { className: styles.label, children: [_jsxs("span", { children: ["\u6700\u5927\u30D7\u30EC\u30A4\u30E4\u30FC\u6570: ", isMaxPlayersDirty && _jsx("small", { children: "(\u5909\u66F4\u3042\u308A)" })] }), _jsx("strong", { children: maxPlayers })] }), _jsx("input", { type: "range", min: "1", max: "10", className: styles.slider, value: maxPlayers, onChange: (e) => setMaxPlayers(Number(e.target.value)) })] })), Object.entries(initialHand).map(([deckId, count]) => (_jsxs("div", { className: styles.field, children: [_jsxs("div", { className: styles.label, children: [_jsx("span", { children: _jsx("strong", { children: deckId }) }), initialValues.initialHand[deckId] !== count && _jsx("small", { children: " (\u5909\u66F4\u3042\u308A)" })] }), _jsxs("div", { className: styles.label, children: [_jsx("span", { children: "\u521D\u671F\u624B\u672D\u679A\u6570:" }), _jsx("strong", { children: count })] }), _jsx("input", { type: "range", min: "0", max: "10", className: styles.slider, value: count, onChange: (e) => {
                                                setInitialHand({
                                                    ...initialHand,
                                                    [deckId]: Number(e.target.value),
                                                });
                                            } })] }, deckId)))] })), _jsx("button", { className: styles.saveButton, onClick: handleSave, disabled: !socket.connected || isSaving || (!isMaxPlayersDirty && !isHandDirty), children: isSaving ? '保存中...' : showSuccess ? '完了' : '変更箇所のみ反映' })] }) })] }));
};
