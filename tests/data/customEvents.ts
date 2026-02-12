// tests/data/customEvents.ts
import type { Socket } from "socket.io";

export function customEvents() {
  return {
    "custom:events:1": (socket: Socket) => {
      console.log("Custom Events 1 triggered", socket.id);
    },
    "custom:events:2": (socket: Socket) => {
      console.log("Custom Events 1 triggered", socket.id);
    },
  };
}
