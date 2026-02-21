import { Token } from './token.js';

/** トークンストア初期化用の定義型 */
export type TokenStoreDef = {
  tokenStoreId: string;
  name: string;
  tokens: Token[];
};
