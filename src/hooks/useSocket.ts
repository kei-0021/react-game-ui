// src/hooks/useSocket.ts
import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

// 戻り値の型を明示的に `Socket | null` に指定する
export function useSocket(url: string): Socket | null {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const newSocket = io(url, { transports: ['websocket', 'polling'] });
    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [url]);

  return socket;
}
