import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import styles from '../ControlPanel.module.css';
export const DiceFactory = ({ newCompId, onAdd, onSuccess, getInitialProps }) => {
    const [newDiceSides, setNewDiceSides] = useState(6);
    const handleAdd = () => {
        const id = newCompId || `dice-${Date.now()}`;
        const initialProps = getInitialProps('Dice', id, newDiceSides);
        onAdd({
            id: id,
            type: 'Dice',
            props: initialProps,
        });
        onSuccess();
    };
    const handleDragStart = (e) => {
        const id = newCompId || `dice-${Date.now()}`;
        const dragData = {
            type: 'Dice',
            id: id,
            props: {
                ...getInitialProps('Dice', id, newDiceSides),
                slotX: 1,
                slotY: 1,
            },
        };
        e.dataTransfer.setData('application/react-game-ui', JSON.stringify(dragData));
    };
    return (_jsxs("div", { className: styles.field, style: { marginTop: '10px' }, children: [_jsx("div", { className: styles.label, style: { fontSize: '11px' }, children: "\u9762\u6570\u3092\u9078\u629E:" }), _jsx("select", { className: styles.compTypeSelect, value: newDiceSides, onChange: (e) => setNewDiceSides(Number(e.target.value)), style: { marginBottom: '10px' }, children: [2, 3, 4, 5, 6, 8, 10, 12, 20].map((n) => (_jsxs("option", { value: n, children: [n, "\u9762"] }, n))) }), _jsxs("div", { draggable: true, onDragStart: handleDragStart, className: styles.dragSourcePreview, style: {
                    width: '60px',
                    height: '60px',
                    border: '2px dashed #888',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'grab',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    marginBottom: '10px',
                }, children: [_jsx("span", { style: { fontSize: '20px' }, children: "\uD83C\uDFB2" }), _jsxs("span", { style: { fontSize: '10px', color: '#ccc' }, children: [newDiceSides, "\u9762"] })] }), _jsx("button", { className: styles.saveButton, style: { width: '100%' }, onClick: handleAdd, disabled: !newCompId, children: "Dice\u3092\u8FFD\u52A0" })] }));
};
