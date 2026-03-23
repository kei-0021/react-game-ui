import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

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
