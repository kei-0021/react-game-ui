// src/types/player.ts

import type { Card } from "./card.js";

// ID のタイプエイリアス
export type PlayerId = string;

export type Player = {
  id: PlayerId;
  name: string;
  score?: number;
  cards?: Card[];
};