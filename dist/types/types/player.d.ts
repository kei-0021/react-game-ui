import type { Card } from "./card.js";
export type PlayerId = string;
export type Player = {
    id: PlayerId;
    name: string;
    score?: number;
    cards?: Card[];
};
