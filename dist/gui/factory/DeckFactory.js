import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import styles from '../ControlPanel.module.css';
const cardImages = import.meta.glob('../../assets/trump/*.png', { eager: true, import: 'default' });
const getCardImage = (suit, num) => {
    const targetKey = `../../assets/trump/${suit}-${num}.png`;
    return cardImages[targetKey] || '';
};
export const DeckFactory = ({ newCompId, onAdd, onSuccess }) => {
    const [deckMode, setDeckMode] = useState('preset');
    const [deckJsonData, setDeckJsonData] = useState(null);
    const [deckFileName, setDeckFileName] = useState('');
    const handleJsonFileChange = (e) => {
        const file = e.target.files?.[0];
        if (!file)
            return;
        setDeckFileName(file.name);
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const json = JSON.parse(event.target?.result);
                setDeckJsonData(Array.isArray(json) ? json : [json]);
            }
            catch {
                alert('JSON解析失敗');
            }
        };
        reader.readAsText(file);
    };
    const executeAdd = () => {
        if (deckMode === 'json' && !deckJsonData) {
            alert('JSONを選択してください');
            return;
        }
        const fieldId = `${newCompId}-field`;
        const companionField = {
            id: fieldId,
            type: 'PlayField',
            props: { deckId: newCompId, title: `${newCompId}用フィールド` },
        };
        let cards = [];
        if (deckMode === 'preset') {
            const common = {
                deckId: newCompId,
                ownerId: null,
                location: 'deck',
                drawCondition: ['hand', 'back'],
                fieldBackCondition: ['discard', 'face'],
                playLocation: 'field',
                isFaceUp: true,
                backColor: 'black',
            };
            cards = ['spades', 'hearts', 'diamonds', 'clubs'].flatMap((suit) => [1, 2].map((num) => ({
                ...common,
                id: `${newCompId}-${suit[0]}${num}`,
                name: `${newCompId}-${suit[0]}${num}`,
                frontImage: getCardImage(suit, num),
            })));
        }
        else {
            cards = deckJsonData;
        }
        const additionalParams = {
            initialDecks: [{ deckId: newCompId, name: 'カード', backColor: 'black', cards }],
        };
        onAdd(companionField, {});
        onAdd({ id: newCompId, type: 'Deck', props: { deckId: newCompId, title: `山札 ${newCompId}` } }, additionalParams);
        onSuccess();
    };
    return (_jsxs("div", { className: styles.field, style: { marginTop: '10px' }, children: [_jsx("div", { className: styles.label, style: { fontSize: '11px' }, children: "\u30C7\u30FC\u30BF\u6295\u5165\u30E2\u30FC\u30C9:" }), _jsxs("div", { style: { display: 'flex', gap: '10px', marginBottom: '10px' }, children: [_jsxs("label", { style: { fontSize: '12px', color: '#fff', cursor: 'pointer' }, children: [_jsx("input", { type: "radio", checked: deckMode === 'preset', onChange: () => setDeckMode('preset') }), " \u30D7\u30EA\u30BB\u30C3\u30C8"] }), _jsxs("label", { style: { fontSize: '12px', color: '#fff', cursor: 'pointer' }, children: [_jsx("input", { type: "radio", checked: deckMode === 'json', onChange: () => setDeckMode('json') }), " JSON"] })] }), deckMode === 'json' && (_jsx("input", { type: "file", accept: ".json", onChange: handleJsonFileChange, className: styles.select })), _jsx("button", { className: styles.saveButton, style: { marginTop: '10px', width: '100%' }, onClick: executeAdd, children: "Deck\u3068Field\u3092\u540C\u6642\u8FFD\u52A0" })] }));
};
