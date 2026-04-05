import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
export function useSocket(url) {
    const [socket, setSocket] = useState(null);
    useEffect(() => {
        const newSocket = io(url, { transports: ['websocket', 'polling'] });
        setSocket(newSocket);
        return () => {
            newSocket.close();
        };
    }, [url]);
    return socket;
}
