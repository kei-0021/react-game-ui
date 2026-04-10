import { jsx as _jsx } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import styles from './systemMessageWindow.module.css';
export function SystemMessageWindow({ socket, roomId, displayDuration = 2000 }) {
    const [displayMessage, setDisplayMessage] = useState('');
    const [currentData, setCurrentData] = useState(null);
    const [queue, setQueue] = useState([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [msgKey, setMsgKey] = useState(0);
    // メッセージの受信：TypeScriptのエラー回避のため return 内を {} で囲む
    useEffect(() => {
        if (!socket)
            return;
        const onMessage = (data) => {
            setQueue((prev) => [...prev, data]);
        };
        socket.on('system:message', onMessage);
        return () => {
            socket.off('system:message', onMessage);
        };
    }, [socket]);
    // 表示開始と上書きのロジック
    useEffect(() => {
        if (queue.length === 0)
            return;
        // すでに表示中の場合、一度フラグを下げてから次のメッセージへ移る
        if (isProcessing) {
            setIsProcessing(false);
            return;
        }
        const nextData = queue[0];
        const remaining = queue.slice(1);
        setQueue(remaining);
        setCurrentData(nextData);
        setDisplayMessage(nextData.message);
        setMsgKey((prev) => prev + 1);
        setIsProcessing(true);
    }, [queue, isProcessing]);
    // タイマー管理
    useEffect(() => {
        // 表示中でない、または永続表示フラグがある場合は何もしない
        if (!isProcessing || !currentData || currentData.isPersistent)
            return;
        const timer = setTimeout(() => {
            setDisplayMessage('');
            setIsProcessing(false);
            setCurrentData(null);
        }, displayDuration);
        return () => {
            clearTimeout(timer);
        };
    }, [isProcessing, currentData, displayDuration]);
    return (_jsx("section", { className: styles.messageContainer, children: _jsx("div", { className: styles.messageList, children: displayMessage && (_jsx("div", { className: styles.messageItemActive, children: displayMessage }, msgKey)) }) }));
}
