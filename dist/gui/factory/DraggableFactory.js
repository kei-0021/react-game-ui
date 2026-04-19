import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import styles from '../ControlPanel.module.css';
export const DraggableFactory = ({ newCompId, onAdd, onSuccess, getInitialProps }) => {
    const [newDraggableColor, setNewDraggableColor] = useState('#ff0000');
    const [uploadImage, setUploadImage] = useState(null);
    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (!file)
            return;
        const reader = new FileReader();
        reader.onloadend = () => setUploadImage(reader.result);
        reader.readAsDataURL(file);
    };
    const getOverrides = () => ({
        color: newDraggableColor,
        image: uploadImage,
    });
    const handleAdd = () => {
        const id = newCompId || `draggable-${Date.now()}`;
        const initialProps = getInitialProps('Draggable', id, getOverrides());
        const additionalParams = {
            draggables: {
                [id]: {
                    id: id,
                    coordinate: { x: 500, y: 500 },
                    zIndex: 100,
                    rotation: 0,
                },
            },
        };
        onAdd({ id: id, type: 'Draggable', props: initialProps }, additionalParams);
        onSuccess();
        setUploadImage(null);
    };
    const handleDragStart = (e) => {
        const id = newCompId || `draggable-${Date.now()}`;
        const dragData = {
            type: 'Draggable',
            id: id,
            props: {
                ...getInitialProps('Draggable', id, getOverrides()),
                slotX: 1,
                slotY: 1,
            },
        };
        e.dataTransfer.setData('application/react-game-ui', JSON.stringify(dragData));
    };
    return (_jsxs("div", { className: styles.field, style: { marginTop: '10px' }, children: [_jsxs("div", { style: { display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '10px' }, children: [_jsx("div", { className: styles.label, style: { fontSize: '11px', margin: 0 }, children: "\u8272:" }), _jsx("input", { type: "color", value: newDraggableColor, onChange: (e) => setNewDraggableColor(e.target.value), style: { cursor: 'pointer', border: 'none', background: 'none', width: '30px', height: '24px' } })] }), _jsx("div", { className: styles.label, style: { fontSize: '11px' }, children: "\u753B\u50CF\u30A2\u30C3\u30D7\u30ED\u30FC\u30C9:" }), _jsx("input", { type: "file", accept: "image/*", className: styles.select, onChange: handleFileChange }), _jsx("div", { className: styles.label, style: { fontSize: '11px', marginTop: '10px' }, children: "\u30D7\u30EC\u30D3\u30E5\u30FC (\u3053\u308C\u3092\u76E4\u9762\u306B\u30C9\u30E9\u30C3\u30B0):" }), _jsxs("div", { draggable: true, onDragStart: handleDragStart, className: styles.dragSourcePreview, style: {
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
                    marginBottom: '10px',
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
                        }, children: "ID\u672A\u8A2D\u5B9A" }))] }), _jsx("button", { className: styles.saveButton, style: { width: '100%' }, onClick: handleAdd, disabled: !newCompId, children: "Draggable\u3092\u8FFD\u52A0" })] }));
};
