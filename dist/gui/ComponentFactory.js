import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { COMPONENT_TYPES } from '@/types/server.js';
import { useState } from 'react';
import styles from './ControlPanel.module.css';
export const ComponentFactory = ({ onAdd, onDelete, existingComponents, fullGameParam, containerRef, }) => {
    const [newCompId, setNewCompId] = useState('');
    const [newCompType, setNewCompType] = useState('Dice');
    // ScoreBoard関連
    const [sbPlayCard, setSbPlayCard] = useState(true);
    const [sbHold, setSbHold] = useState(false);
    const [sbFlip, setSbFlip] = useState(false);
    const [sbTurnSkip, setSbTurnSkip] = useState(true);
    const [sbRoundSkip, setSbRoundSkip] = useState(false);
    // Token関連
    const [newTokenCount, setNewTokenCount] = useState(10);
    // Dice関連
    const [newDiceSides, setNewDiceSides] = useState(6);
    // Draggable関連
    const [newDraggableColor, setNewDraggableColor] = useState('#ff0000');
    const [uploadImage, setUploadImage] = useState(null);
    const [newDraggableX, setNewDraggableX] = useState(500);
    const [newDraggableY, setNewDraggableY] = useState(500);
    const [isDraggingPreview, setIsDraggingPreview] = useState(false);
    const existingIds = existingComponents.map((c) => c.id);
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
                initialProps = {
                    playCardButton: [sbPlayCard, true],
                    holdButton: [sbHold, true],
                    flipButton: [sbFlip, true],
                    turnSkipButton: [sbTurnSkip, true],
                    roundSkipButton: [sbRoundSkip, true],
                };
                break;
            case 'TokenStore':
                initialProps = {
                    tokenStoreId: newCompId,
                    title: `トークン置き場`,
                };
                additionalParams.initialTokenStores = [
                    {
                        tokenStoreId: newCompId,
                        name: newCompId,
                        tokens: Array.from({ length: newTokenCount }, (_, i) => ({
                            id: `${newCompId}-s${i + 1}`,
                            name: '💰',
                            color: '#D4AF37',
                        })),
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
                    color: newDraggableColor,
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
    const handleDeleteClick = (compId) => {
        const target = existingComponents.find((c) => c.id === compId);
        if (!target)
            return;
        let additionalParams = {};
        // 削除対象のタイプに応じて、消すべき Record のキーを指定
        if (target.type === 'Draggable') {
            const currentDraggables = { ...(fullGameParam?.draggables || {}) };
            delete currentDraggables[compId];
            additionalParams.draggables = currentDraggables;
        }
        if (target.type === 'TokenStore') {
            additionalParams.initialTokenStores = (fullGameParam?.initialTokenStores || []).filter((s) => s.tokenStoreId !== compId);
        }
        // 最終的な削除実行を親（ControlPanel）に伝える
        onDelete(compId, additionalParams);
    };
    return (_jsxs("div", { className: styles.addComponentBox, children: [_jsx("div", { className: styles.label, children: "\u30B3\u30F3\u30DD\u30FC\u30CD\u30F3\u30C8\u8FFD\u52A0:" }), _jsxs("div", { className: styles.createSection, children: [_jsx("select", { className: styles.compTypeSelect, value: newCompType, onChange: (e) => setNewCompType(e.target.value), children: COMPONENT_TYPES.map((type) => (_jsx("option", { value: type, children: type }, type))) }), _jsx("input", { type: "text", className: styles.flexFill, style: { borderColor: isDuplicateId ? '#ff4444' : '' }, placeholder: "ID (\u4F8B: dice-2)", value: newCompId, onChange: (e) => setNewCompId(e.target.value) }), _jsx("button", { className: styles.saveButton, onClick: handleAddClick, disabled: !newCompId || isDuplicateId, children: "\u8FFD\u52A0" })] }), isDuplicateId && (_jsx("div", { style: { color: '#ff4444', fontSize: '12px', marginTop: '-4px' }, children: "\u3053\u306EID\u306F\u65E2\u306B\u4F7F\u7528\u3055\u308C\u3066\u3044\u307E\u3059" })), newCompType === 'ScoreBoard' && (_jsxs("div", { className: styles.field, style: { marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '5px' }, children: [_jsx("div", { className: styles.label, style: { fontSize: '11px' }, children: "\u6709\u52B9\u306B\u3059\u308B\u30DC\u30BF\u30F3:" }), [
                        { label: 'カードプレイ', state: sbPlayCard, setter: setSbPlayCard },
                        { label: 'ホールド', state: sbHold, setter: setSbHold },
                        { label: 'フリップ', state: sbFlip, setter: setSbFlip },
                        { label: 'ターンスキップ', state: sbTurnSkip, setter: setSbTurnSkip },
                        { label: 'ラウンドスキップ', state: sbRoundSkip, setter: setSbRoundSkip },
                    ].map((item) => (_jsxs("label", { style: {
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            color: '#fff',
                        }, children: [_jsx("input", { type: "checkbox", checked: item.state, onChange: (e) => item.setter(e.target.checked), style: { cursor: 'pointer' } }), item.label] }, item.label)))] })), newCompType === 'TokenStore' && (_jsxs("div", { className: styles.field, style: { marginTop: '10px' }, children: [_jsx("div", { className: styles.label, style: { fontSize: '11px' }, children: "\u521D\u671F\u500B\u6570:" }), _jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '8px' }, children: [_jsx("input", { type: "range", min: "1", max: "50", value: newTokenCount, onChange: (e) => setNewTokenCount(Number(e.target.value)), className: styles.slider }), _jsx("span", { style: { fontSize: '12px', color: '#fff', minWidth: '30px' }, children: newTokenCount })] })] })), newCompType === 'Dice' && (_jsxs("div", { className: styles.field, style: { marginTop: '10px' }, children: [_jsx("div", { className: styles.label, style: { fontSize: '11px' }, children: "\u9762\u6570\u3092\u9078\u629E:" }), _jsx("select", { className: styles.compTypeSelect, value: newDiceSides, onChange: (e) => setNewDiceSides(Number(e.target.value)), children: [2, 3, 4, 5, 6, 8, 10, 12, 20].map((n) => (_jsxs("option", { value: n, children: [n, "\u9762"] }, n))) })] })), newCompType === 'Draggable' && (_jsxs("div", { className: styles.field, style: { marginTop: '10px' }, children: [_jsxs("div", { style: { display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '10px' }, children: [_jsx("div", { className: styles.label, style: { fontSize: '11px', margin: 0 }, children: "\u8272:" }), _jsx("input", { type: "color", value: newDraggableColor, onChange: (e) => setNewDraggableColor(e.target.value), style: { cursor: 'pointer', border: 'none', background: 'none', width: '30px', height: '24px' } })] }), _jsx("div", { className: styles.label, style: { fontSize: '11px' }, children: "\u753B\u50CF\u30A2\u30C3\u30D7\u30ED\u30FC\u30C9:" }), _jsx("input", { type: "file", accept: "image/*", className: styles.select, onChange: handleFileChange }), _jsx("div", { style: {
                            position: 'fixed',
                            // 保存されている「相対座標」に、「現在の盤面の物理位置」を足して描画する
                            left: `${(containerRef.current?.getBoundingClientRect().left || 0) + newDraggableX}px`,
                            top: `${(containerRef.current?.getBoundingClientRect().top || 0) + newDraggableY}px`,
                            width: '50px',
                            height: '50px',
                            transform: 'translate(-50%, -50%)',
                            border: `2px dashed ${newDraggableColor}`,
                            backgroundColor: `${newDraggableColor}4D`,
                            cursor: 'move',
                            zIndex: 9999,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            pointerEvents: 'auto',
                        }, onMouseDown: (e) => {
                            setIsDraggingPreview(true);
                            const rect = containerRef.current?.getBoundingClientRect();
                            if (!rect)
                                return;
                            const offsetX = e.clientX - (rect.left + newDraggableX);
                            const offsetY = e.clientY - (rect.top + newDraggableY);
                            const onMouseMove = (moveEvent) => {
                                // 物理座標から「部屋の左上」と「最初のズレ」を引いて相対座標を出す
                                setNewDraggableX(moveEvent.clientX - rect.left - offsetX);
                                setNewDraggableY(moveEvent.clientY - rect.top - offsetY);
                            };
                            const onMouseUp = () => {
                                setIsDraggingPreview(false);
                                document.removeEventListener('mousemove', onMouseMove);
                                document.removeEventListener('mouseup', onMouseUp);
                            };
                            document.addEventListener('mousemove', onMouseMove);
                            document.addEventListener('mouseup', onMouseUp);
                        }, children: _jsx("span", { style: { fontSize: '10px', color: 'white', userSelect: 'none' }, children: "Preview" }) })] })), existingComponents.length > 0 && (_jsxs("div", { style: { marginTop: '15px' }, children: [_jsx("div", { className: styles.label, children: "\u914D\u7F6E\u6E08\u307F\u30B3\u30F3\u30DD\u30FC\u30CD\u30F3\u30C8:" }), _jsx("div", { className: styles.componentList, children: existingComponents.map((comp) => (_jsxs("div", { className: styles.componentItem, children: [_jsxs("span", { children: [comp.id, " ", _jsxs("small", { children: ["(", comp.type, ")"] })] }), _jsx("button", { onClick: () => handleDeleteClick(comp.id), className: styles.deleteCompBtn, children: "\u2715" })] }, comp.id))) })] }))] }));
};
