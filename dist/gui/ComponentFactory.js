import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { COMPONENT_TYPES } from '@/types/component.js';
import { useState } from 'react';
import styles from './ControlPanel.module.css';
import { DeckFactory } from './factory/DeckFactory.js';
import { DiceFactory } from './factory/DiceFactory.js';
import { DraggableFactory } from './factory/DraggableFactory.js';
import { ScoreBoardFactory } from './factory/ScoreBoardFactory.js';
import { TokenStoreFactory } from './factory/TokenStoreFactory.js';
const FILTERED_COMPONENT_TYPES = COMPONENT_TYPES.filter((type) => type !== 'PlayField');
export const ComponentFactory = ({ onAdd, onDelete, existingComponents, fullGameParam }) => {
    const [newCompId, setNewCompId] = useState('');
    const [newCompType, setNewCompType] = useState('Dice');
    const existingIds = existingComponents.map((c) => c.id);
    const isDuplicateId = existingIds.includes(newCompId);
    // Factory管理対象のリスト
    const FACTORY_MANAGED_TYPES = ['Deck', 'Dice', 'Draggable', 'ScoreBoard', 'TokenStore'];
    /**
     * Props生成ロジックの集約
     */
    const getInitialProps = (type, targetId, overrides = {}) => {
        switch (type) {
            case 'Dice':
                const sides = overrides.sides || 6;
                return {
                    diceId: targetId,
                    sides: sides,
                    title: `${sides}面ダイス`,
                    customFaces: sides === 4 ? ['/weather_sunny.png', '/weather_cloud.png', '/weather_wind.png', '/weather_rain.png'] : [],
                };
            case 'Draggable':
                return {
                    draggableId: targetId,
                    image: overrides.image || '/hanabishi.svg',
                    mask: true,
                    color: overrides.color || '#ff0000',
                    size: 100,
                    isDebug: true,
                };
            case 'ScoreBoard':
                return {
                    playCardButton: [overrides.sbPlayCard ?? true, true],
                    holdButton: [overrides.sbHold ?? false, true],
                    flipButton: [overrides.sbFlip ?? false, true],
                    turnSkipButton: [overrides.sbTurnSkip ?? true, true],
                    roundSkipButton: [overrides.sbRoundSkip ?? false, true],
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
    const handleAddClick = () => {
        if (!newCompId || isDuplicateId)
            return;
        // Factory分離済みのタイプはここでは処理しない
        if (FACTORY_MANAGED_TYPES.includes(newCompType))
            return;
        const initialProps = getInitialProps(newCompType, newCompId);
        // 現在のComponentFactoryに残っている追加ロジックはTimer等のシンプルなもののみ
        onAdd({ id: newCompId, type: newCompType, props: initialProps });
        setNewCompId('');
    };
    const handleDeleteClick = (compId) => {
        const target = existingComponents.find((c) => c.id === compId);
        if (!target)
            return;
        let additionalParams = {};
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
        onDelete(compId, additionalParams);
    };
    const isFactoryManaged = FACTORY_MANAGED_TYPES.includes(newCompType);
    return (_jsxs("div", { className: styles.addComponentBox, children: [_jsx("div", { className: styles.label, children: "\u30B3\u30F3\u30DD\u30FC\u30CD\u30F3\u30C8\u8FFD\u52A0:" }), _jsxs("div", { className: styles.createSection, children: [_jsx("select", { className: styles.compTypeSelect, value: newCompType, onChange: (e) => setNewCompType(e.target.value), children: FILTERED_COMPONENT_TYPES.map((type) => (_jsx("option", { value: type, children: type }, type))) }), _jsx("input", { type: "text", className: styles.flexFill, style: { borderColor: isDuplicateId ? '#ff4444' : '' }, placeholder: "ID (\u4F8B: dice-2)", value: newCompId, onChange: (e) => setNewCompId(e.target.value) }), !isFactoryManaged && (_jsx("button", { className: styles.saveButton, onClick: handleAddClick, disabled: !newCompId || isDuplicateId, children: "\u8FFD\u52A0" }))] }), isDuplicateId && (_jsx("div", { style: { color: '#ff4444', fontSize: '12px', marginTop: '-4px' }, children: "\u3053\u306EID\u306F\u65E2\u306B\u4F7F\u7528\u3055\u308C\u3066\u3044\u307E\u3059" })), newCompType === 'Deck' && _jsx(DeckFactory, { newCompId: newCompId, onAdd: onAdd, onSuccess: () => setNewCompId('') }), newCompType === 'Dice' && (_jsx(DiceFactory, { newCompId: newCompId, onAdd: onAdd, onSuccess: () => setNewCompId(''), getInitialProps: (type, id, sides) => getInitialProps(type, id, { sides }) })), newCompType === 'Draggable' && (_jsx(DraggableFactory, { newCompId: newCompId, onAdd: onAdd, onSuccess: () => setNewCompId(''), getInitialProps: getInitialProps })), newCompType === 'ScoreBoard' && (_jsx(ScoreBoardFactory, { newCompId: newCompId, onAdd: onAdd, onSuccess: () => setNewCompId(''), getInitialProps: getInitialProps })), newCompType === 'TokenStore' && (_jsx(TokenStoreFactory, { newCompId: newCompId, onAdd: onAdd, onSuccess: () => setNewCompId(''), getInitialProps: getInitialProps })), existingComponents.length > 0 && (_jsxs("div", { style: { marginTop: '15px' }, children: [_jsx("div", { className: styles.label, children: "\u914D\u7F6E\u6E08\u307F\u30B3\u30F3\u30DD\u30FC\u30CD\u30F3\u30C8:" }), _jsx("div", { className: styles.componentList, children: existingComponents.map((comp) => (_jsxs("div", { className: styles.componentItem, children: [_jsxs("span", { children: [comp.id, " ", _jsxs("small", { children: ["(", comp.type, ")"] })] }), _jsx("button", { onClick: () => handleDeleteClick(comp.id), className: styles.deleteCompBtn, children: "\u2715" })] }, comp.id))) })] }))] }));
};
