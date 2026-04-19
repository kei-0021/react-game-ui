import type { TokenStoreId } from './definition.js';
import type { TokenData } from './token.js';

export type TokenStoreData = {
  tokenStoreId: TokenStoreId;
  name: string;
  tokens: TokenData[];
};
