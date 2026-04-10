import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { COMPONENT_TYPES } from '@/types/component.js';
import { useState } from 'react';
import styles from './ControlPanel.module.css';
const FILTERED_COMPONENT_TYPES = COMPONENT_TYPES.filter((type) => type !== 'PlayField');
const cardImages = import.meta.glob('../assets/trump/*.png', { eager: true, import: 'default' });
const getCardImage = (suit, num) => {
    // globに渡したベースパスと引数を完全に一致させる
    const targetKey = `../assets/trump/${suit}-${num}.png`;
    // 完全一致で引き当てる
    return cardImages[targetKey] || '';
};
export const ComponentFactory = ({ onAdd, onDelete, existingComponents, fullGameParam, containerRef, }) => {
    const [newCompId, setNewCompId] = useState('');
    const [newCompType, setNewCompType] = useState('Dice');
    // Deck関連
    const [deckMode, setDeckMode] = useState('preset');
    const [deckJsonData, setDeckJsonData] = useState(null);
    const [deckFileName, setDeckFileName] = useState('');
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
            catch (err) {
                alert('JSONファイルの解析に失敗しました。形式を確認してください。');
                setDeckJsonData(null);
            }
        };
        reader.readAsText(file);
    };
    const handleAddClick = () => {
        if (!newCompId || isDuplicateId)
            return;
        let initialProps = {};
        let additionalParams = {};
        switch (newCompType) {
            case 'Deck':
                const fieldId = `${newCompId}-field`;
                // 対になる PlayField を定義
                const companionField = {
                    id: fieldId,
                    type: 'PlayField',
                    props: {
                        deckId: newCompId,
                        title: `${newCompId}用フィールド`,
                    },
                };
                initialProps = {
                    deckId: newCompId,
                    title: `山札 ${newCompId}`,
                };
                let cards = [];
                if (deckMode === 'preset') {
                    // プリセット（既存の共通化ロジック）
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
                    const suits = ['spades', 'hearts', 'diamonds', 'clubs'].flatMap((suit) => [1, 2].map((num) => ({
                        suffix: `${suit[0]}${num}`,
                        img: getCardImage(suit, num),
                    })));
                    cards = suits.map((suit) => ({
                        ...common,
                        id: `${newCompId}-${suit.suffix}`,
                        name: `${newCompId}-${suit.suffix}`,
                        frontImage: suit.img,
                    }));
                }
                else {
                    if (!deckJsonData) {
                        alert('JSONファイルを選択してください');
                        return;
                    }
                    cards = deckJsonData;
                }
                additionalParams.initialDecks = [
                    {
                        deckId: newCompId,
                        name: 'カード',
                        backColor: 'black',
                        cards: cards,
                    },
                ];
                // フィールドとデッキの両方を登録
                onAdd(companionField, {});
                onAdd({ id: newCompId, type: 'Deck', props: initialProps }, additionalParams);
                // 共通のクリーンアップへ行かずに終了
                setNewCompId('');
                setUploadImage(null);
                return;
            case 'PlayField':
                initialProps = {
                    deckId: newCompId,
                    title: newCompId,
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
                    boardId: newCompId,
                    allowPieceDrag: true,
                };
                break;
            case 'Draggable':
                initialProps = {
                    draggableId: newCompId,
                    image: uploadImage || '/hanabishi.svg',
                    mask: true,
                    color: newDraggableColor,
                    size: 100,
                    isDebug: true,
                };
                additionalParams.draggables = {
                    [newCompId]: {
                        id: newCompId,
                        coordinate: { x: newDraggableX, y: newDraggableY },
                        zIndex: 100,
                        rotation: 0,
                    },
                };
                break;
            case 'Dice':
                initialProps = {
                    diceId: newCompId,
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
    return (_jsxs("div", { className: styles.addComponentBox, children: [_jsx("div", { className: styles.label, children: "\u30B3\u30F3\u30DD\u30FC\u30CD\u30F3\u30C8\u8FFD\u52A0:" }), _jsxs("div", { className: styles.createSection, children: [_jsx("select", { className: styles.compTypeSelect, value: newCompType, onChange: (e) => setNewCompType(e.target.value), children: FILTERED_COMPONENT_TYPES.map((type) => (_jsx("option", { value: type, children: type }, type))) }), _jsx("input", { type: "text", className: styles.flexFill, style: { borderColor: isDuplicateId ? '#ff4444' : '' }, placeholder: "ID (\u4F8B: dice-2)", value: newCompId, onChange: (e) => setNewCompId(e.target.value) }), _jsx("button", { className: styles.saveButton, onClick: handleAddClick, disabled: !newCompId || isDuplicateId, children: "\u8FFD\u52A0" })] }), isDuplicateId && (_jsx("div", { style: { color: '#ff4444', fontSize: '12px', marginTop: '-4px' }, children: "\u3053\u306EID\u306F\u65E2\u306B\u4F7F\u7528\u3055\u308C\u3066\u3044\u307E\u3059" })), newCompType === 'Deck' && (_jsxs("div", { className: styles.field, style: { marginTop: '10px' }, children: [_jsx("div", { className: styles.label, style: { fontSize: '11px' }, children: "\u30C7\u30FC\u30BF\u6295\u5165\u30E2\u30FC\u30C9:" }), _jsxs("div", { style: { display: 'flex', gap: '10px', marginBottom: '10px' }, children: [_jsxs("label", { style: { fontSize: '12px', color: '#fff', cursor: 'pointer' }, children: [_jsx("input", { type: "radio", name: "deckMode", checked: deckMode === 'preset', onChange: () => setDeckMode('preset') }), ' ', "\u30D7\u30EA\u30BB\u30C3\u30C8 (\u30C8\u30E9\u30F3\u30D7)"] }), _jsxs("label", { style: { fontSize: '12px', color: '#fff', cursor: 'pointer' }, children: [_jsx("input", { type: "radio", name: "deckMode", checked: deckMode === 'json', onChange: () => setDeckMode('json') }), ' ', "JSON\u30D5\u30A1\u30A4\u30EB"] })] }), deckMode === 'json' && (_jsxs("div", { children: [_jsx("input", { type: "file", accept: ".json", onChange: handleJsonFileChange, className: styles.select }), deckFileName && (_jsxs("div", { style: { fontSize: '10px', color: '#0f0', marginTop: '4px' }, children: ["\u8AAD\u307F\u8FBC\u307F\u5B8C\u4E86: ", deckFileName, " (", deckJsonData?.length, "\u679A)"] }))] }))] })), newCompType === 'ScoreBoard' && (_jsxs("div", { className: styles.field, style: { marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '5px' }, children: [_jsx("div", { className: styles.label, style: { fontSize: '11px' }, children: "\u6709\u52B9\u306B\u3059\u308B\u30DC\u30BF\u30F3:" }), [
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
                        }, children: [_jsx("input", { type: "checkbox", checked: item.state, onChange: (e) => item.setter(e.target.checked), style: { cursor: 'pointer' } }), item.label] }, item.label)))] })), newCompType === 'TokenStore' && (_jsxs("div", { className: styles.field, style: { marginTop: '10px' }, children: [_jsx("div", { className: styles.label, style: { fontSize: '11px' }, children: "\u521D\u671F\u500B\u6570:" }), _jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '8px' }, children: [_jsx("input", { type: "range", min: "1", max: "50", value: newTokenCount, onChange: (e) => setNewTokenCount(Number(e.target.value)), className: styles.slider }), _jsx("span", { style: { fontSize: '12px', color: '#fff', minWidth: '30px' }, children: newTokenCount })] })] })), newCompType === 'Dice' && (_jsxs("div", { className: styles.field, style: { marginTop: '10px' }, children: [_jsx("div", { className: styles.label, style: { fontSize: '11px' }, children: "\u9762\u6570\u3092\u9078\u629E:" }), _jsx("select", { className: styles.compTypeSelect, value: newDiceSides, onChange: (e) => setNewDiceSides(Number(e.target.value)), style: { marginBottom: '10px' }, children: [2, 3, 4, 5, 6, 8, 10, 12, 20].map((n) => (_jsxs("option", { value: n, children: [n, "\u9762"] }, n))) }), _jsxs("div", { draggable: true, onDragStart: (e) => {
                            const dragData = {
                                type: 'Dice',
                                id: newCompId || `dice-${Date.now()}`,
                                props: {
                                    diceId: newCompId || `dice-${Date.now()}`,
                                    sides: newDiceSides,
                                    title: `${newDiceSides}面ダイス`,
                                    slotX: 1,
                                    slotY: 1,
                                },
                            };
                            e.dataTransfer.setData('application/react-game-ui', JSON.stringify(dragData));
                        }, className: styles.dragSourcePreview, style: {
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
                        }, children: [_jsx("span", { style: { fontSize: '20px' }, children: "\uD83C\uDFB2" }), _jsxs("span", { style: { fontSize: '10px', color: '#ccc' }, children: [newDiceSides, "\u9762"] })] })] })), newCompType === 'Draggable' && (_jsxs("div", { className: styles.field, style: { marginTop: '10px' }, children: [_jsxs("div", { style: { display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '10px' }, children: [_jsx("div", { className: styles.label, style: { fontSize: '11px', margin: 0 }, children: "\u8272:" }), _jsx("input", { type: "color", value: newDraggableColor, onChange: (e) => setNewDraggableColor(e.target.value), style: { cursor: 'pointer', border: 'none', background: 'none', width: '30px', height: '24px' } })] }), _jsx("div", { className: styles.label, style: { fontSize: '11px' }, children: "\u753B\u50CF\u30A2\u30C3\u30D7\u30ED\u30FC\u30C9:" }), _jsx("input", { type: "file", accept: "image/*", className: styles.select, onChange: handleFileChange }), _jsx("div", { className: styles.label, style: { fontSize: '11px', marginTop: '10px' }, children: "\u30D7\u30EC\u30D3\u30E5\u30FC (\u3053\u308C\u3092\u76E4\u9762\u306B\u30C9\u30E9\u30C3\u30B0):" }), _jsxs("div", { draggable: true, onDragStart: (e) => {
                            const dragData = {
                                type: 'Draggable',
                                id: newCompId || `drag-${Date.now()}`,
                                props: {
                                    image: uploadImage || '/hanabishi.svg',
                                    color: newDraggableColor,
                                    size: 80,
                                },
                            };
                            e.dataTransfer.setData('application/react-game-ui', JSON.stringify(dragData));
                        }, className: styles.dragSourcePreview, style: {
                            width: '80px',
                            height: '80px',
                            border: `2px solid ${newDraggableColor}`,
                            backgroundColor: `${newDraggableColor}33`, // 少し透明度を下げた背景
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
                                    pointerEvents: 'none', // imgタグがドラッグイベントを邪魔しないように
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
