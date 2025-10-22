import type { Player } from './player.js';
import type { Resource } from './resource.js';

export type PlayerWithResources = Player & { resources: Resource[] };
