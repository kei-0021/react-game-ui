import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from 'react';
import styles from './ControlPanel.module.css';
export const ControlPanel = ({ socket, gameMeta }) => {
    const [selectedGameId, setSelectedGameId] = useState(gameMeta[0]?.gameId || '');
    const [maxPlayers, setMaxPlayers] = useState(1);
    const [handDeckId, setHandDeckId] = useState('main');
    const [handCount, setHandCount] = useState(0);
    const [initialValues, setInitialValues] = useState({
        maxPlayers: 1,
        handDeckId: 'main',
        handCount: 0,
    });
    const [isOpen, setIsOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    // 選択中のゲームのメタデータを取得
    const selectedGame = useMemo(() => gameMeta.find((g) => g.gameId === selectedGameId), [selectedGameId, gameMeta]);
    // ゲーム選択が切り替わった時に Meta の値を同期
    useEffect(() => {
        if (selectedGame) {
            const configMaxPlayers = selectedGame.maxPlayers ?? 1;
            const configHandDeckId = selectedGame.initialHand?.deckId ?? 'main';
            const configHandCount = selectedGame.initialHand?.count ?? 0;
            const newInit = {
                maxPlayers: configMaxPlayers,
                handDeckId: configHandDeckId,
                handCount: configHandCount,
            };
            setInitialValues(newInit);
            setMaxPlayers(configMaxPlayers);
            setHandDeckId(configHandDeckId);
            setHandCount(configHandCount);
        }
    }, [selectedGame]);
    const isMaxPlayersDirty = maxPlayers !== initialValues.maxPlayers;
    const isHandDirty = handDeckId !== initialValues.handDeckId || handCount !== initialValues.handCount;
    useEffect(() => {
        const onUpdated = (data) => {
            if (data.success) {
                setIsSaving(false);
                setShowSuccess(true);
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
        if (!socket.connected || !selectedGameId)
            return;
        const newParam = {};
        if (isMaxPlayersDirty)
            newParam.maxPlayers = maxPlayers;
        if (isHandDirty) {
            newParam.initialHand = {
                deckId: handDeckId,
                count: handCount,
            };
        }
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
    return (_jsxs(_Fragment, { children: [_jsx("button", { className: styles.hamburger, onClick: () => setIsOpen(!isOpen), children: isOpen ? '✕' : '☰' }), _jsx("div", { className: `${styles.wrapper} ${isOpen ? styles.open : ''}`, children: _jsxs("div", { className: styles.container, children: [_jsx("h3", { className: styles.title, children: "\u30B3\u30F3\u30C8\u30ED\u30FC\u30EB\u30D1\u30CD\u30EB" }), _jsxs("div", { className: styles.field, children: [_jsx("div", { className: styles.label, children: "\u5BFE\u8C61\u30B2\u30FC\u30E0\u3092\u9078\u629E:" }), _jsx("select", { className: styles.select, value: selectedGameId, onChange: (e) => setSelectedGameId(e.target.value), children: gameMeta.map((game) => (_jsx("option", { value: game.gameId, children: game.gameId }, game.gameId))) })] }), selectedGame && (_jsxs(_Fragment, { children: [selectedGame.maxPlayers !== undefined && (_jsxs("div", { className: styles.field, children: [_jsxs("div", { className: styles.label, children: [_jsxs("span", { children: ["\u6700\u5927\u30D7\u30EC\u30A4\u30E4\u30FC\u6570: ", isMaxPlayersDirty && _jsx("small", { children: "(\u5909\u66F4\u3042\u308A)" })] }), _jsx("strong", { children: maxPlayers })] }), _jsx("input", { type: "range", min: "1", max: "10", className: styles.slider, value: maxPlayers, onChange: (e) => setMaxPlayers(Number(e.target.value)) })] })), selectedGame.initialHand !== undefined && (_jsxs("div", { className: styles.field, children: [_jsxs("div", { className: styles.label, children: [_jsxs("span", { children: ["\u521D\u671F\u624B\u672D: ", isHandDirty && _jsx("small", { children: "(\u5909\u66F4\u3042\u308A)" })] }), _jsx("strong", { children: handDeckId })] }), _jsxs("div", { className: styles.label, children: [_jsx("span", { children: "\u679A\u6570:" }), _jsx("strong", { children: handCount })] }), _jsx("input", { type: "range", min: "0", max: "10", className: styles.slider, value: handCount, onChange: (e) => setHandCount(Number(e.target.value)) })] }))] })), _jsx("button", { className: styles.saveButton, onClick: handleSave, disabled: !socket.connected || isSaving || (!isMaxPlayersDirty && !isHandDirty), children: isSaving ? '保存中...' : showSuccess ? '完了' : '変更箇所のみ反映' })] }) })] }));
};
