import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
// src/components/Timer.tsx
import { useEffect, useState } from "react";
export default function Timer({ socket = null, onFinish }) {
    const [timeLeft, setTimeLeft] = useState(null);
    useEffect(() => {
        if (!socket)
            return;
        const handleStart = (duration) => {
            setTimeLeft(duration);
        };
        const handleUpdate = (remaining) => {
            setTimeLeft(remaining);
            if (remaining <= 0)
                onFinish?.();
        };
        socket.on("timer:start", handleStart);
        socket.on("timer:update", handleUpdate);
        return () => {
            socket.off("timer:start", handleStart);
            socket.off("timer:update", handleUpdate);
        };
    }, [socket, onFinish]);
    const start = () => {
        if (!socket)
            return;
        socket.emit("timer:start", 30); // 例: 30秒
    };
    return (_jsxs("div", { style: {
            width: "300px",
            height: "80px",
            border: "2px solid #333",
            borderRadius: "8px",
            padding: "8px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "#f9f9f9",
            boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
            fontFamily: "sans-serif",
        }, children: [_jsxs("div", { style: {
                    fontSize: "1.5rem",
                    fontWeight: "bold",
                    color: timeLeft !== null
                        ? timeLeft <= 6
                            ? "red"
                            : timeLeft <= 15
                                ? "orange"
                                : "green"
                        : "gray",
                    transition: "color 0.5s ease",
                }, children: ["\u6B8B\u308A\u6642\u9593: ", timeLeft ?? "-", "s"] }), _jsx("div", { style: { marginTop: "6px" }, children: _jsx("button", { onClick: start, style: { marginRight: "4px" }, children: "\u958B\u59CB" }) })] }));
}
