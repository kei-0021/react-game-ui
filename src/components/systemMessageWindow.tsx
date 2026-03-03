// src/components/systemMessageWindow.tsx
import { RoomId } from '@/types/definition.js';
import { SystemMessageData } from '@/types/socketData.js';
import React, { useEffect, useState } from 'react';
import { Socket } from 'socket.io-client';
import styles from './systemMessageWindow.module.css';

interface SystemMessageWindowProps {
  socket: Socket | null;
  roomId: RoomId;
  displayDuration?: number;
}

export const SystemMessageWindow: React.FC<SystemMessageWindowProps> = ({ socket, roomId, displayDuration = 2000 }) => {
  const [displayMessage, setDisplayMessage] = useState<string>('');
  const [queue, setQueue] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [msgKey, setMsgKey] = useState<number>(0);

  // ソケット通信の受信設定
  useEffect(() => {
    if (!socket) return;

    const onMessage = (data: SystemMessageData) => {
      setQueue((prev) => [...prev, data.message]);
    };

    socket.on('system:message', onMessage);
    return () => {
      socket.off('system:message', onMessage);
    };
  }, [socket]);

  // キューを監視して「表示開始」のトリガーを引く
  useEffect(() => {
    // 表示中でなく、かつキューに未処理のメッセージがある場合のみ実行
    if (isProcessing || queue.length === 0) return;

    // キューから先頭を取り出す
    const nextMsg = queue[0];
    const remaining = queue.slice(1);

    // 表示ステートを更新
    setQueue(remaining);
    setDisplayMessage(nextMsg);
    setMsgKey((prev) => prev + 1);

    // 表示中フラグを立てる（これが下のタイマー用Effectを起動させる）
    setIsProcessing(true);
  }, [queue, isProcessing]);

  // 「表示中」状態を監視して、タイマーで「表示終了」を管理する
  useEffect(() => {
    // 表示中でなければ何もしない
    if (!isProcessing) return;

    // 指定時間後に表示を消去し、次のメッセージを許可する
    const timer = setTimeout(() => {
      console.log('hello'); // これで確実に実行されます
      setDisplayMessage('');
      setIsProcessing(false); // これが false に戻ることで、上の Effect が再び動けるようになります
    }, displayDuration);

    // クリーンアップ：このタイマー自体は isProcessing が変わるまで破棄されない
    return () => clearTimeout(timer);
  }, [isProcessing, displayDuration]);

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
};
