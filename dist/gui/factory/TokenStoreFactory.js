import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import styles from '../ControlPanel.module.css';
export const TokenStoreFactory = ({ newCompId, onAdd, onSuccess, getInitialProps }) => {
    const [newTokenCount, setNewTokenCount] = useState(10);
    const handleAdd = () => {
        const id = newCompId || `token-${Date.now()}`;
        const initialProps = getInitialProps('TokenStore', id);
        const additionalParams = {
            initialTokenStores: [
                {
                    tokenStoreId: id,
                    name: id,
                    tokens: Array.from({ length: newTokenCount }, (_, i) => ({
                        id: `${id}-s${i + 1}`,
                        name: '💰',
                        color: '#D4AF37',
                    })),
                },
            ],
        };
        onAdd({ id, type: 'TokenStore', props: initialProps }, additionalParams);
        onSuccess();
    };
    return (_jsxs("div", { className: styles.field, style: { marginTop: '10px' }, children: [_jsx("div", { className: styles.label, style: { fontSize: '11px' }, children: "\u521D\u671F\u500B\u6570:" }), _jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '8px' }, children: [_jsx("input", { type: "range", min: "1", max: "50", value: newTokenCount, onChange: (e) => setNewTokenCount(Number(e.target.value)), className: styles.slider }), _jsx("span", { style: { fontSize: '12px', color: '#fff', minWidth: '30px' }, children: newTokenCount })] }), _jsx("button", { className: styles.saveButton, style: { width: '100%', marginTop: '10px' }, onClick: handleAdd, disabled: !newCompId, children: "TokenStore\u3092\u8FFD\u52A0" })] }));
};
