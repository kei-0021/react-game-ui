import { useEffect, useState } from 'react';
import { Socket } from 'socket.io-client';

type TimerProps = {
  socket?: Socket | null;
  initialDuration: number;
  onFinish?: () => void;
  roomId?: string; // ルーム対応用
};

export default function Timer({ socket = null, initialDuration, onFinish, roomId }: TimerProps) {
  // 💡 修正1: 初期状態を null ではなく initialDuration の値に設定する。
  // これにより、開始前は設定された秒数が表示される。
  const [timeLeft, setTimeLeft] = useState<number>(initialDuration);

  useEffect(() => {
    if (!socket || !roomId) return;

    const handleStart = (data: { duration: number; roomId: string }) => {
      if (data.roomId !== roomId) return; // 他のルームのイベントは無視
      setTimeLeft(data.duration);
    };

    const handleUpdate = (data: { remaining: number; roomId: string }) => {
      if (data.roomId !== roomId) return;
      setTimeLeft(data.remaining);
    };

    const handleFinish = (data: { roomId: string }) => {
      if (data.roomId !== roomId) return;
      setTimeLeft(0);
      onFinish?.(); // サーバーの終了通知に基づいてコールバックを発火
    };

    socket.on('timer:start', handleStart);
    socket.on('timer:update', handleUpdate);
    socket.on('timer:finish', handleFinish);

    return () => {
      socket.off('timer:start', handleStart);
      socket.off('timer:update', handleUpdate);
      socket.off('timer:finish', handleFinish);
    };
  }, [socket, roomId, onFinish, initialDuration]); // initialDuration を依存配列に追加

  const start = () => {
    if (!socket || !roomId || initialDuration <= 0) return;

    // サーバーに開始を依頼する前に、ローカルでも初期値を設定しておくと見た目がスムーズ
    setTimeLeft(initialDuration);

    // initialDuration をサーバーに送信
    socket.emit('timer:start', { duration: initialDuration, roomId }); // ルームIDと初期時間付き
  };

  // 💡 修正2: timeLeft が null になる可能性がないため、null合体演算子 (??) を削除
  return (
    <div
      style={{
        width: '300px',
        height: '80px',
        border: '2px solid #333',
        borderRadius: '8px',
        padding: '8px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f9f9f9',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        fontFamily: 'sans-serif',
      }}
    >
      <div
        style={{
          fontSize: '1.5rem',
          fontWeight: 'bold',
          color: timeLeft <= 6 ? 'red' : timeLeft <= 15 ? 'orange' : 'green',
          transition: 'color 0.5s ease',
        }}
      >
        残り時間: {timeLeft}s
      </div>

      <div style={{ marginTop: '6px' }}>
        <button onClick={start} style={{ marginRight: '4px' }}>
          タイマー開始 ({initialDuration}s)
        </button>
      </div>
    </div>
  );
}
