// src/types/player.ts

import type { Card } from "./card.js";
import type { PlayerId } from "./definition.js";
import type { Resource } from "./resource.js";
import type { Token } from "./token.js";

export type Player = {
  id: PlayerId;
  name: string;
  score?: number;
  cards?: Card[];
  tokens?: Token[];
  resources?: Resource[]; 
};