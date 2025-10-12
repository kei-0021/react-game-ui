// src/types/player.ts (修正後)

import type { Card } from "./card.js";
import type { Resource } from "./resource.js";

// ID のタイプエイリアス
export type PlayerId = string;

export type Player = {
  id: PlayerId;
  name: string;
  score?: number;
  cards?: Card[];
  resources?: Resource[]; 
};