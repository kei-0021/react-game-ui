import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// src/gui/ComponentFactory.tsx
import { COMPONENT_TYPES } from '@/types/server.js';
import { useState } from 'react';
import styles from './ControlPanel.module.css';
export const ComponentFactory = ({ onAdd, existingIds }) => {
    const [newCompId, setNewCompId] = useState('');
    const [newCompType, setNewCompType] = useState('Dice');
    const [uploadImage, setUploadImage] = useState(null);
    const isDuplicateId = existingIds.includes(newCompId);
    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (!file)
            return;
        const reader = new FileReader();
        reader.onloadend = () => setUploadImage(reader.result);
        reader.readAsDataURL(file);
    };
    const handleAddClick = () => {
        if (!newCompId || isDuplicateId)
            return;
        let initialProps = {};
        let additionalParams = {};
        switch (newCompType) {
            case 'Deck':
                initialProps = {
                    deckId: `deck-${newCompId}`,
                    title: '山札',
                };
                additionalParams.initialDecks = [
                    {
                        deckId: `deck-${newCompId}`,
                        name: 'カード',
                        backColor: 'black',
                        cards: [
                            {
                                id: '1',
                                deckId: `deck-${newCompId}`,
                                name: '1',
                                ownerId: null,
                                location: 'deck',
                                drawCondition: ['field', 'face'],
                                playLocation: 'discard',
                                isFaceUp: true,
                                backColor: 'black',
                            },
                        ],
                    },
                ];
                break;
            case 'PlayField':
                initialProps = {
                    deckId: 'sub',
                    title: 'sub',
                };
                break;
            case 'ScoreBoard':
                initialProps = {};
                break;
            case 'TokenStore':
                initialProps = {
                    tokenStoreId: 'ARTIFACT',
                    title: '遺物トークン',
                };
                additionalParams.initialTokenStores = [
                    {
                        tokenStoreId: 'ARTIFACT',
                        name: '遺物',
                        tokens: [
                            { id: 'ARTIFACT-s1', name: '💰', color: '#D4AF37' },
                            { id: 'ARTIFACT-s2', name: '💰', color: '#D4AF37' },
                        ],
                    },
                ];
                break;
            case 'GridBoard':
                initialProps = {
                    boardId: `borad-${newCompId}`,
                    allowPieceDrag: true,
                };
                break;
            case 'Draggable':
                initialProps = {
                    draggableId: `piece-${newCompId}`,
                    image: uploadImage || '/hanabishi.svg',
                    mask: true,
                    color: 'red',
                    size: 100,
                    isDebug: true,
                };
                additionalParams.draggables = {
                    [`piece-${newCompId}`]: {
                        id: `piece-${newCompId}`,
                        coordinate: { x: 500, y: 500 },
                        zIndex: 100,
                        rotation: 0,
                    },
                };
                break;
            case 'Dice':
                initialProps = {
                    diceId: `天気-${newCompId}`,
                    sides: 4,
                    title: '天気ダイス',
                    tooltipText: '快晴・曇り・風・雨',
                    customFaces: ['/weather_sunny.png', '/weather_cloud.png', '/weather_wind.png', '/weather_rain.png'],
                };
                break;
            case 'Timer':
                initialProps = { initialDuration: 30 };
                break;
            case 'SystemMessageWindow':
                initialProps = {};
                break;
            default:
                initialProps = {};
        }
        const newComponent = {
            id: newCompId,
            type: newCompType,
            props: initialProps,
        };
        onAdd(newComponent, additionalParams);
        setNewCompId('');
        setUploadImage(null);
    };
    return (_jsxs("div", { className: styles.addComponentBox, children: [_jsx("div", { className: styles.label, children: "\u30B3\u30F3\u30DD\u30FC\u30CD\u30F3\u30C8\u8FFD\u52A0:" }), _jsxs("div", { className: styles.createSection, children: [_jsx("select", { className: styles.compTypeSelect, value: newCompType, onChange: (e) => setNewCompType(e.target.value), children: COMPONENT_TYPES.map((type) => (_jsx("option", { value: type, children: type }, type))) }), _jsx("input", { type: "text", className: styles.flexFill, style: { borderColor: isDuplicateId ? '#ff4444' : '' }, placeholder: "ID (\u4F8B: dice-2)", value: newCompId, onChange: (e) => setNewCompId(e.target.value) }), _jsx("button", { className: styles.saveButton, onClick: () => handleAddClick(), disabled: !newCompId || isDuplicateId, children: "\u8FFD\u52A0" })] }), isDuplicateId && (_jsx("div", { style: { color: '#ff4444', fontSize: '12px', marginTop: '-4px' }, children: "\u3053\u306EID\u306F\u65E2\u306B\u4F7F\u7528\u3055\u308C\u3066\u3044\u307E\u3059" })), newCompType === 'Draggable' && (_jsxs("div", { className: styles.field, style: { marginTop: '10px' }, children: [_jsx("div", { className: styles.label, style: { fontSize: '11px' }, children: "\u753B\u50CF\u30A2\u30C3\u30D7\u30ED\u30FC\u30C9:" }), _jsx("input", { type: "file", accept: "image/*", className: styles.select, onChange: handleFileChange }), uploadImage && (_jsx("div", { style: { marginTop: '5px' }, children: _jsx("img", { src: uploadImage, alt: "preview", style: { width: '50px', height: '50px', objectFit: 'contain', border: '1px solid #555' } }) }))] }))] }));
};
