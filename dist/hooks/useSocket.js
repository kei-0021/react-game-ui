// src/hooks/useSocket.ts
import { useEffect, useState } from "react";
import { io } from "socket.io-client";
// 戻り値の型を明示的に `Socket | null` に指定する
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
