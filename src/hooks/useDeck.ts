// src/hooks/useDeck.ts
import { useEffect, useState } from "react";
import { Socket } from "socket.io-client";
import { Card } from "../components/Card.js";

export function useDeck(socket?: Socket | null) { // ← socket は optional に
  const [deck, setDeck] = useState<Card[]>([]);
  const [drawnCards, setDrawnCards] = useState<Card[]>([]);

  useEffect(() => {
    if (!socket) return; // ← socket がない場合は何もしない

    const handleInit = (d: Card[]) => {
      console.log("deck:init 受信", d);
      setDeck(d);
    };
    const handleDrawn = (card: Card) => {
      console.log("deck:drawn 受信", card);
      setDrawnCards((prev) => [...prev, card]);
    };

    socket.on("deck:init", handleInit);
    socket.on("deck:drawn", handleDrawn);

    return () => {
      socket.off("deck:init", handleInit);
      socket.off("deck:drawn", handleDrawn);
    };
  }, [socket]);

  const draw = () => socket?.emit("deck:draw");
  const shuffle = () => socket?.emit("deck:shuffle");

  return { deck, drawnCards, draw, shuffle };
}
