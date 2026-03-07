import { Token } from './token.js';

export type TokenStore = {
  tokenStoreId: string;
  name: string;
  tokens: Token[];
};
