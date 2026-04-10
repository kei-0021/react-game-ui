import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import styles from '../ControlPanel.module.css';
export const ScoreBoardFactory = ({ newCompId, onAdd, onSuccess, getInitialProps }) => {
    const [sbPlayCard, setSbPlayCard] = useState(true);
    const [sbHold, setSbHold] = useState(false);
    const [sbFlip, setSbFlip] = useState(false);
    const [sbTurnSkip, setSbTurnSkip] = useState(true);
    const [sbRoundSkip, setSbRoundSkip] = useState(false);
    const handleAdd = () => {
        const id = newCompId || `sb-${Date.now()}`;
        const overrides = {
            sbPlayCard,
            sbHold,
            sbFlip,
            sbTurnSkip,
            sbRoundSkip,
        };
        onAdd({
            id: id,
            type: 'ScoreBoard',
            props: getInitialProps('ScoreBoard', id, overrides),
        });
        onSuccess();
    };
    const buttonConfigs = [
        { label: 'カードプレイ', state: sbPlayCard, setter: setSbPlayCard },
        { label: 'ホールド', state: sbHold, setter: setSbHold },
        { label: 'フリップ', state: sbFlip, setter: setSbFlip },
        { label: 'ターンスキップ', state: sbTurnSkip, setter: setSbTurnSkip },
        { label: 'ラウンドスキップ', state: sbRoundSkip, setter: setSbRoundSkip },
    ];
    return (_jsxs("div", { className: styles.field, style: { marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '5px' }, children: [_jsx("div", { className: styles.label, style: { fontSize: '11px' }, children: "\u6709\u52B9\u306B\u3059\u308B\u30DC\u30BF\u30F3:" }), buttonConfigs.map((item) => (_jsxs("label", { style: {
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    color: '#fff',
                }, children: [_jsx("input", { type: "checkbox", checked: item.state, onChange: (e) => item.setter(e.target.checked) }), item.label] }, item.label))), _jsx("button", { className: styles.saveButton, style: { width: '100%', marginTop: '5px' }, onClick: handleAdd, disabled: !newCompId, children: "ScoreBoard\u3092\u8FFD\u52A0" })] }));
};
