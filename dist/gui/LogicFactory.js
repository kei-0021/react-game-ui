import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import styles from './ControlPanel.module.css';
export const LogicFactory = ({ selectedGame, isSaving, onSync }) => {
    const [instructions, setInstructions] = useState([]);
    const [initialInstructions, setInitialInstructions] = useState([]);
    // 内部でDirtyチェックを完結させる
    const isDirty = JSON.stringify(instructions) !== JSON.stringify(initialInstructions);
    // サーバーデータとの同期ロジックを移設
    useEffect(() => {
        if (selectedGame && !isSaving) {
            const rawOnCardPlay = selectedGame.onCardPlay;
            const configOnCardPlay = Array.isArray(rawOnCardPlay) ? rawOnCardPlay : [];
            setInitialInstructions([...configOnCardPlay]);
            if (!isDirty) {
                setInstructions([...configOnCardPlay]);
            }
        }
    }, [selectedGame, isSaving]);
    // 状態変化を親の ControlPanel へ通知
    useEffect(() => {
        onSync(isDirty, instructions);
    }, [isDirty, instructions]);
    const handleAdd = () => {
        onChange([...instructions, { type: 'ADD_SCORE', playerId: 'ALL', points: 0 }]);
    };
    const onChange = (newInstructions) => {
        setInstructions(newInstructions);
    };
    const handleUpdate = (index, patch) => {
        const next = [...instructions];
        next[index] = { ...next[index], ...patch };
        onChange(next);
    };
    const handleDelete = (index) => {
        onChange(instructions.filter((_, i) => i !== index));
    };
    if (!selectedGame)
        return null;
    return (_jsxs("div", { className: styles.section, children: [_jsx("h4", { className: styles.subTitle, children: "onCardPlay \u30ED\u30B8\u30C3\u30AF" }), instructions.map((inst, idx) => (_jsxs("div", { className: styles.effectRow, children: [_jsxs("select", { value: inst.type, onChange: (e) => handleUpdate(idx, { type: e.target.value }), children: [_jsx("option", { value: "ADD_SCORE", children: "ADD_SCORE" }), _jsx("option", { value: "EMIT_MSG", children: "EMIT_MSG" }), _jsx("option", { value: "UPDATE_PHASE", children: "UPDATE_PHASE" })] }), inst.type === 'ADD_SCORE' && (_jsx("input", { type: "number", value: inst.points || 0, onChange: (e) => handleUpdate(idx, { points: Number(e.target.value) }), placeholder: "\u70B9\u6570" })), _jsx("button", { className: styles.deleteMini, onClick: () => handleDelete(idx), children: "\u524A\u9664" })] }, idx))), _jsx("button", { className: styles.addBtn, onClick: handleAdd, children: "+ \u547D\u4EE4\u3092\u8FFD\u52A0" })] }));
};
