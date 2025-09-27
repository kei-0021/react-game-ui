import { Card } from "./card.js";

export type Player = {
  id: string;
  name: string;
  score?: number;
  cards?: Card[];
};