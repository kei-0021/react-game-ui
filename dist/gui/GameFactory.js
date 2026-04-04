import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import styles from './ControlPanel.module.css';
export const GameFactory = ({ socket, gameMeta, selectedGameId, onSelect }) => {
    const [newGameName, setNewGameName] = useState('');
    const [newGameIcon, setNewGameIcon] = useState('🎲');
    const [isDeleteMode, setIsDeleteMode] = useState(false);
    const handleCreateGame = () => {
        if (!newGameName || !socket.connected)
            return;
        const sanitizedGameId = newGameName.toLowerCase().replace(/[^a-z]/g, '');
        if (!sanitizedGameId)
            return;
        socket.emit('game:create', {
            gameName: sanitizedGameId,
            gameIcon: newGameIcon || '🎲',
        });
        setNewGameName('');
    };
    const handleDeleteGame = () => {
        if (!selectedGameId || !socket.connected)
            return;
        if (window.confirm(`ゲーム「${selectedGameId}」を削除しますか？`)) {
            socket.emit('game:delete', { gameId: selectedGameId });
            setIsDeleteMode(false);
        }
    };
    return (_jsxs("div", { className: styles.gameFactoryBox, children: [_jsxs("div", { className: styles.field, children: [_jsx("div", { className: styles.label, children: "\u65B0\u898F\u30B2\u30FC\u30E0\u4F5C\u6210:" }), _jsxs("div", { className: styles.createSection, children: [_jsx("input", { type: "text", className: `${styles.select} ${styles.iconInput}`, placeholder: "Icon", value: newGameIcon, onChange: (e) => setNewGameIcon(e.target.value.slice(0, 5)) }), _jsx("input", { type: "text", className: `${styles.select} ${styles.flexFill}`, placeholder: "Game ID (\u82F1\u5C0F\u6587\u5B57)", value: newGameName, onChange: (e) => setNewGameName(e.target.value) }), _jsx("button", { className: `${styles.saveButton} ${styles.createButton}`, onClick: handleCreateGame, disabled: !newGameName, children: "\u4F5C\u6210" })] })] }), _jsx("hr", { className: styles.divider }), _jsxs("div", { className: styles.field, children: [_jsxs("div", { className: styles.rangeHeader, children: [_jsx("div", { className: styles.label, children: "\u5BFE\u8C61\u30B2\u30FC\u30E0\u3092\u9078\u629E:" }), _jsx("button", { onClick: () => setIsDeleteMode(!isDeleteMode), className: styles.deleteModeBtn, style: { color: isDeleteMode ? '#ff4444' : '#888', fontSize: '11px' }, children: isDeleteMode ? 'キャンセル' : '削除モード' })] }), _jsxs("div", { className: styles.createSection, children: [_jsxs("select", { className: `${styles.select} ${styles.flexFill}`, value: selectedGameId, onChange: (e) => onSelect(e.target.value), children: [gameMeta.length === 0 && _jsx("option", { value: "", children: "\u8AAD\u307F\u8FBC\u307F\u4E2D..." }), gameMeta.map((game) => (_jsxs("option", { value: game.gameId, children: [game.gameIcon, " ", game.gameId] }, game.gameId)))] }), isDeleteMode && selectedGameId && (_jsx("button", { className: styles.saveButton, onClick: handleDeleteGame, style: { background: '#ff4444', border: 'none' }, children: "\u524A\u9664" }))] })] })] }));
};
