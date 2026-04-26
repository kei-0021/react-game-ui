// src/components/SystemMessageWindow.tsx
import { RoomId } from '@/types/definition.js';
import { SystemMessageData } from '@/types/socketData.js';
import { useEffect, useState } from 'react';
import { Socket } from 'socket.io-client';
import styles from './systemMessageWindow.module.css';

interface SystemMessageWindowProps {
  socket: Socket | null;
  roomId: RoomId;
  displayDuration?: number;
}

export function SystemMessageWindow({ socket, roomId, displayDuration = 2000 }: SystemMessageWindowProps) {
  const [displayMessage, setDisplayMessage] = useState<string>('');
  const [currentData, setCurrentData] = useState<SystemMessageData | null>(null);
  const [queue, setQueue] = useState<SystemMessageData[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [msgKey, setMsgKey] = useState<number>(0);

  // メッセージの受信：TypeScriptのエラー回避のため return 内を {} で囲む
  useEffect(() => {
    if (!socket) return;
    const onMessage = (data: SystemMessageData) => {
      setQueue((prev) => [...prev, data]);
    };
    socket.on('system:message', onMessage);
    return () => {
      socket.off('system:message', onMessage);
    };
  }, [socket]);

  // 表示開始と上書きのロジック
  useEffect(() => {
    if (queue.length === 0) return;

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
    if (!isProcessing || !currentData || currentData.isPersistent) return;

    const timer = setTimeout(() => {
      setDisplayMessage('');
      setIsProcessing(false);
      setCurrentData(null);
    }, displayDuration);

    return () => {
      clearTimeout(timer);
    };
  }, [isProcessing, currentData, displayDuration]);

  return (
    <section className={styles.messageContainer}>
      <div className={styles.messageList}>
        {displayMessage && (
          <div key={msgKey} className={styles.messageItemActive}>
            {displayMessage}
          </div>
        )}
      </div>
    </section>
  );
}
