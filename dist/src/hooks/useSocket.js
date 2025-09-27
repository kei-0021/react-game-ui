// src/hooks/useSocket.ts
import { useEffect, useState } from "react";
import { io } from "socket.io-client";
export function useSocket(url) {
    const [socket, setSocket] = useState(null);
    useEffect(() => {
        const s = io(url);
        setSocket(s);
        s.on("connect", () => console.log("socket connected!", s.id));
        s.on("connect_error", (err) => console.log("connect_error", err));
        return () => {
            s.disconnect();
        };
    }, [url]);
    return socket;
}
