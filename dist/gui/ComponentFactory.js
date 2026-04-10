import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { COMPONENT_TYPES } from '@/types/component.js';
import { useState } from 'react';
import styles from './ControlPanel.module.css';
import { DeckFactory } from './factory/DeckFactory.js';
import { DiceFactory } from './factory/DiceFactory.js';
const FILTERED_COMPONENT_TYPES = COMPONENT_TYPES.filter((type) => type !== 'PlayField');
export const ComponentFactory = ({ onAdd, onDelete, existingComponents, fullGameParam }) => {
    const [newCompId, setNewCompId] = useState('');
    const [newCompType, setNewCompType] = useState('Dice');
    // --- UI状態 (Dice/Deck 以外) ---
    // ScoreBoard関連
    const [sbPlayCard, setSbPlayCard] = useState(true);
    const [sbHold, setSbHold] = useState(false);
    const [sbFlip, setSbFlip] = useState(false);
    const [sbTurnSkip, setSbTurnSkip] = useState(true);
    const [sbRoundSkip, setSbRoundSkip] = useState(false);
    // Token関連
    const [newTokenCount, setNewTokenCount] = useState(10);
    // Draggable関連
    const [newDraggableColor, setNewDraggableColor] = useState('#ff0000');
    const [uploadImage, setUploadImage] = useState(null);
    const existingIds = existingComponents.map((c) => c.id);
    const isDuplicateId = existingIds.includes(newCompId);
    /**
     * Props生成ロジックの集約
     * DiceFactory等、外部Factoryからも参照できるように sides などの引数を拡張
     */
    const getInitialProps = (type, targetId, diceSidesOverride) => {
        switch (type) {
            case 'Dice':
                const sides = diceSidesOverride || 6;
                return {
                    diceId: targetId,
                    sides: sides,
                    title: `${sides}面ダイス`,
                    customFaces: sides === 4 ? ['/weather_sunny.png', '/weather_cloud.png', '/weather_wind.png', '/weather_rain.png'] : [],
                };
            case 'Draggable':
                return {
                    draggableId: targetId,
                    image: uploadImage || '/hanabishi.svg',
                    mask: true,
                    color: newDraggableColor,
                    size: 100,
                    isDebug: true,
                };
            case 'ScoreBoard':
                return {
                    playCardButton: [sbPlayCard, true],
                    holdButton: [sbHold, true],
                    flipButton: [sbFlip, true],
                    turnSkipButton: [sbTurnSkip, true],
                    roundSkipButton: [sbRoundSkip, true],
                };
            case 'TokenStore':
                return {
                    tokenStoreId: targetId,
                    title: `トークン置き場`,
                };
            case 'Timer':
                return { initialDuration: 30 };
            default:
                return {};
        }
    };
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
        // Deck と Dice はそれぞれの Factory 内で完結するため、ここでは処理しない
        if (newCompType === 'Deck' || newCompType === 'Dice')
            return;
        const initialProps = getInitialProps(newCompType, newCompId);
        let additionalParams = {};
        switch (newCompType) {
            case 'TokenStore':
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
            case 'Draggable':
                additionalParams.draggables = {
                    [newCompId]: {
                        id: newCompId,
                        coordinate: { x: 500, y: 500 },
                        zIndex: 100,
                        rotation: 0,
                    },
                };
                break;
            case 'SystemMessageWindow':
                // PropsはgetInitialPropsで空オブジェクトが返る
                break;
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
        if (target.type === 'Deck') {
            const originalDecks = fullGameParam?.initialDecks || [];
            additionalParams.initialDecks = originalDecks.filter((d) => d.deckId !== compId);
        }
        if (target.type === 'TokenStore') {
            additionalParams.initialTokenStores = (fullGameParam?.initialTokenStores || []).filter((s) => s.tokenStoreId !== compId);
        }
        if (target.type === 'Draggable') {
            const currentDraggables = { ...(fullGameParam?.draggables || {}) };
            delete currentDraggables[compId];
            additionalParams.draggables = currentDraggables;
        }
        // 最終的な削除実行を親（ControlPanel）に伝える
        onDelete(compId, additionalParams);
    };
    return (_jsxs("div", { className: styles.addComponentBox, children: [_jsx("div", { className: styles.label, children: "\u30B3\u30F3\u30DD\u30FC\u30CD\u30F3\u30C8\u8FFD\u52A0:" }), _jsxs("div", { className: styles.createSection, children: [_jsx("select", { className: styles.compTypeSelect, value: newCompType, onChange: (e) => setNewCompType(e.target.value), children: FILTERED_COMPONENT_TYPES.map((type) => (_jsx("option", { value: type, children: type }, type))) }), _jsx("input", { type: "text", className: styles.flexFill, style: { borderColor: isDuplicateId ? '#ff4444' : '' }, placeholder: "ID (\u4F8B: dice-2)", value: newCompId, onChange: (e) => setNewCompId(e.target.value) }), newCompType !== 'Deck' && newCompType !== 'Dice' && (_jsx("button", { className: styles.saveButton, onClick: handleAddClick, disabled: !newCompId || isDuplicateId, children: "\u8FFD\u52A0" }))] }), isDuplicateId && (_jsx("div", { style: { color: '#ff4444', fontSize: '12px', marginTop: '-4px' }, children: "\u3053\u306EID\u306F\u65E2\u306B\u4F7F\u7528\u3055\u308C\u3066\u3044\u307E\u3059" })), newCompType === 'Deck' && _jsx(DeckFactory, { newCompId: newCompId, onAdd: onAdd, onSuccess: () => setNewCompId('') }), newCompType === 'Dice' && (_jsx(DiceFactory, { newCompId: newCompId, onAdd: onAdd, onSuccess: () => setNewCompId(''), getInitialProps: getInitialProps })), newCompType === 'ScoreBoard' && (_jsxs("div", { className: styles.field, style: { marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '5px' }, children: [_jsx("div", { className: styles.label, style: { fontSize: '11px' }, children: "\u6709\u52B9\u306B\u3059\u308B\u30DC\u30BF\u30F3:" }), [
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
                        }, children: [_jsx("input", { type: "checkbox", checked: item.state, onChange: (e) => item.setter(e.target.checked) }), item.label] }, item.label)))] })), newCompType === 'TokenStore' && (_jsxs("div", { className: styles.field, style: { marginTop: '10px' }, children: [_jsx("div", { className: styles.label, style: { fontSize: '11px' }, children: "\u521D\u671F\u500B\u6570:" }), _jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '8px' }, children: [_jsx("input", { type: "range", min: "1", max: "50", value: newTokenCount, onChange: (e) => setNewTokenCount(Number(e.target.value)), className: styles.slider }), _jsx("span", { style: { fontSize: '12px', color: '#fff', minWidth: '30px' }, children: newTokenCount })] })] })), newCompType === 'Draggable' && (_jsxs("div", { className: styles.field, style: { marginTop: '10px' }, children: [_jsxs("div", { style: { display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '10px' }, children: [_jsx("div", { className: styles.label, style: { fontSize: '11px', margin: 0 }, children: "\u8272:" }), _jsx("input", { type: "color", value: newDraggableColor, onChange: (e) => setNewDraggableColor(e.target.value) })] }), _jsx("div", { className: styles.label, style: { fontSize: '11px' }, children: "\u753B\u50CF\u30A2\u30C3\u30D7\u30ED\u30FC\u30C9:" }), _jsx("input", { type: "file", accept: "image/*", className: styles.select, onChange: handleFileChange }), _jsx("div", { className: styles.label, style: { fontSize: '11px', marginTop: '10px' }, children: "\u30D7\u30EC\u30D3\u30E5\u30FC (\u3053\u308C\u3092\u76E4\u9762\u306B\u30C9\u30E9\u30C3\u30B0):" }), _jsxs("div", { draggable: true, onDragStart: (e) => {
                            const id = newCompId || `drag-${Date.now()}`;
                            const dragData = {
                                type: 'Draggable',
                                id: id,
                                props: {
                                    ...getInitialProps('Draggable', id),
                                    slotX: 1,
                                    slotY: 1,
                                },
                            };
                            e.dataTransfer.setData('application/react-game-ui', JSON.stringify(dragData));
                        }, className: styles.dragSourcePreview, style: {
                            width: '80px',
                            height: '80px',
                            border: `2px solid ${newDraggableColor}`,
                            backgroundColor: `${newDraggableColor}33`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'grab',
                            borderRadius: '8px',
                            overflow: 'hidden',
                            position: 'relative',
                            transition: 'transform 0.1s ease',
                        }, children: [_jsx("img", { src: uploadImage || '/hanabishi.svg', alt: "preview", style: {
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'contain',
                                    pointerEvents: 'none',
                                } }), !newCompId && (_jsx("div", { style: {
                                    position: 'absolute',
                                    bottom: 0,
                                    backgroundColor: 'rgba(0,0,0,0.6)',
                                    color: '#fff',
                                    fontSize: '9px',
                                    width: '100%',
                                    textAlign: 'center',
                                }, children: "ID\u672A\u8A2D\u5B9A" }))] })] })), existingComponents.length > 0 && (_jsxs("div", { style: { marginTop: '15px' }, children: [_jsx("div", { className: styles.label, children: "\u914D\u7F6E\u6E08\u307F\u30B3\u30F3\u30DD\u30FC\u30CD\u30F3\u30C8:" }), _jsx("div", { className: styles.componentList, children: existingComponents.map((comp) => (_jsxs("div", { className: styles.componentItem, children: [_jsxs("span", { children: [comp.id, " ", _jsxs("small", { children: ["(", comp.type, ")"] })] }), _jsx("button", { onClick: () => handleDeleteClick(comp.id), className: styles.deleteCompBtn, children: "\u2715" })] }, comp.id))) })] }))] }));
};
