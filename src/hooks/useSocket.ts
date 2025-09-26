// src/hooks/useSocket.ts
import { useEffect, useState } from "react";
import { io, type Socket } from "socket.io-client";

export function useSocket(url: string) {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const s = io(url);
    setSocket(s);

    s.on("connect", () => console.log("socket connected!", s.id));
    s.on("connect_error", (err) => console.log("connect_error", err));

    return () => {
      s.disconnect();
    };
  }, [url]);

  return socket!;
}
