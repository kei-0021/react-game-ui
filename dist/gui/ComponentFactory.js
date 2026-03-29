import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { COMPONENT_TYPES } from '@/types/server.js';
import { useState } from 'react';
import styles from './ControlPanel.module.css';
export const ComponentFactory = ({ onAdd, existingIds }) => {
    const [newCompId, setNewCompId] = useState('');
    const [newCompType, setNewCompType] = useState('Dice');
    const [newDiceSides, setNewDiceSides] = useState(6);
    // 初期位置State
    const [uploadImage, setUploadImage] = useState(null);
    const [newDraggableX, setNewDraggableX] = useState(500);
    const [newDraggableY, setNewDraggableY] = useState(500);
    const [isDraggingPreview, setIsDraggingPreview] = useState(false);
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
                    deckId: `deck`,
                    title: '山札',
                };
                additionalParams.initialDecks = [
                    {
                        deckId: `deck`,
                        name: 'カード',
                        backColor: 'black',
                        cards: [
                            {
                                id: '1',
                                deckId: `deck`,
                                name: '1',
                                ownerId: null,
                                location: 'deck',
                                drawCondition: ['hand', 'back'],
                                fieldBackCondition: ['discard', 'face'],
                                playLocation: 'field',
                                isFaceUp: true,
                                backColor: 'black',
                            },
                        ],
                    },
                ];
                break;
            case 'PlayField':
                initialProps = {
                    deckId: `deck`,
                    title: `deck`,
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
                        coordinate: { x: newDraggableX, y: newDraggableY },
                        zIndex: 100,
                        rotation: 0,
                    },
                };
                break;
            case 'Dice':
                initialProps = {
                    diceId: `dice-${newCompId}`,
                    sides: newDiceSides,
                    title: `${newDiceSides}面ダイス`,
                    // 4面の場合は天気ダイス
                    customFaces: newDiceSides === 4
                        ? ['/weather_sunny.png', '/weather_cloud.png', '/weather_wind.png', '/weather_rain.png']
                        : [],
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
    return (_jsxs("div", { className: styles.addComponentBox, children: [_jsx("div", { className: styles.label, children: "\u30B3\u30F3\u30DD\u30FC\u30CD\u30F3\u30C8\u8FFD\u52A0:" }), _jsxs("div", { className: styles.createSection, children: [_jsx("select", { className: styles.compTypeSelect, value: newCompType, onChange: (e) => setNewCompType(e.target.value), children: COMPONENT_TYPES.map((type) => (_jsx("option", { value: type, children: type }, type))) }), _jsx("input", { type: "text", className: styles.flexFill, style: { borderColor: isDuplicateId ? '#ff4444' : '' }, placeholder: "ID (\u4F8B: dice-2)", value: newCompId, onChange: (e) => setNewCompId(e.target.value) }), _jsx("button", { className: styles.saveButton, onClick: () => handleAddClick(), disabled: !newCompId || isDuplicateId, children: "\u8FFD\u52A0" })] }), isDuplicateId && (_jsx("div", { style: { color: '#ff4444', fontSize: '12px', marginTop: '-4px' }, children: "\u3053\u306EID\u306F\u65E2\u306B\u4F7F\u7528\u3055\u308C\u3066\u3044\u307E\u3059" })), newCompType === 'Dice' && (_jsxs("div", { className: styles.field, style: { marginTop: '10px' }, children: [_jsx("div", { className: styles.label, style: { fontSize: '11px' }, children: "\u9762\u6570\u3092\u9078\u629E:" }), _jsx("select", { className: styles.compTypeSelect, value: newDiceSides, onChange: (e) => setNewDiceSides(Number(e.target.value)), children: [2, 3, 4, 5, 6, 8, 10, 12, 20].map((n) => (_jsxs("option", { value: n, children: [n, "\u9762"] }, n))) })] })), newCompType === 'Draggable' && (_jsxs("div", { className: styles.field, style: { marginTop: '10px' }, children: [_jsx("div", { className: styles.label, style: { fontSize: '11px' }, children: "\u753B\u50CF\u30A2\u30C3\u30D7\u30ED\u30FC\u30C9:" }), _jsx("input", { type: "file", accept: "image/*", className: styles.select, onChange: handleFileChange }), _jsx("div", { style: { marginTop: '10px', fontSize: '11px', color: '#aaa' }, children: "\u203B\u753B\u9762\u4E0A\u306E\u8D64\u3044\u30D7\u30EC\u30D3\u30E5\u30FC\u3092\u30C9\u30E9\u30C3\u30B0\u3057\u3066\u521D\u671F\u4F4D\u7F6E\u3092\u6C7A\u3081\u3066\u304F\u3060\u3055\u3044" }), _jsx("div", { style: {
                            position: 'fixed',
                            left: `${newDraggableX}px`,
                            top: `${newDraggableY}px`,
                            width: '50px',
                            height: '50px',
                            border: '2px dashed #ff4444',
                            backgroundColor: 'rgba(255, 68, 68, 0.3)',
                            cursor: 'move',
                            zIndex: 9999,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            pointerEvents: 'auto',
                        }, onMouseDown: (e) => {
                            setIsDraggingPreview(true);
                            const startX = e.clientX - newDraggableX;
                            const startY = e.clientY - newDraggableY;
                            const onMouseMove = (moveEvent) => {
                                setNewDraggableX(moveEvent.clientX - startX);
                                setNewDraggableY(moveEvent.clientY - startY);
                            };
                            const onMouseUp = () => {
                                setIsDraggingPreview(false);
                                document.removeEventListener('mousemove', onMouseMove);
                                document.removeEventListener('mouseup', onMouseUp);
                            };
                            document.addEventListener('mousemove', onMouseMove);
                            document.addEventListener('mouseup', onMouseUp);
                        }, children: _jsx("span", { style: { fontSize: '10px', color: 'white', userSelect: 'none' }, children: "Preview" }) }), _jsxs("div", { style: { display: 'flex', gap: '10px', marginTop: '10px', fontSize: '11px' }, children: [_jsxs("span", { children: ["X: ", Math.round(newDraggableX)] }), _jsxs("span", { children: ["Y: ", Math.round(newDraggableY)] })] })] }))] }));
};
